import puppeteer, { Browser, Page } from "puppeteer";

import { News } from "@/entities/news";

import { withRetry } from "@/shared/api/error-handler";

/**
 * 네이버 뉴스 크롤러
 *
 * Puppeteer를 사용하여 네이버 뉴스 페이지에서
 * 경제/증시 관련 뉴스를 크롤링합니다.
 */

/**
 * 크롤링 설정
 */
const SCRAPER_CONFIG = {
  /** 네이버 뉴스 경제 섹션 URL */
  BASE_URL: "https://news.naver.com/section/101",

  /** User-Agent (봇 차단 우회) */
  USER_AGENT:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

  /** 페이지 로드 타임아웃 (ms) */
  TIMEOUT: 30000,

  /** 각 뉴스 크롤링 간격 (ms) */
  DELAY_BETWEEN_NEWS: 2000,

  /** 본문 최대 길이 */
  MAX_CONTENT_LENGTH: 300,
};

/**
 * 브라우저 초기화
 */
async function initBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: true, // Headless 모드
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });
}

/**
 * 페이지 초기화 및 설정
 */
async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  // User-Agent 설정
  await page.setUserAgent(SCRAPER_CONFIG.USER_AGENT);

  // 불필요한 리소스 차단 (속도 최적화)
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // 타임아웃 설정
  page.setDefaultTimeout(SCRAPER_CONFIG.TIMEOUT);

  return page;
}

/**
 * 뉴스 목록 추출
 */
async function extractNewsList(page: Page, count: number): Promise<Array<{ url: string; title: string }>> {
  await page.goto(SCRAPER_CONFIG.BASE_URL, {
    waitUntil: "domcontentloaded",
  });

  // 뉴스 링크 추출
  const newsLinks = await page.evaluate((targetCount) => {
    const articles = Array.from(document.querySelectorAll("div.sa_text"));
    const results: Array<{ url: string; title: string }> = [];

    for (const article of articles) {
      if (results.length >= targetCount) break;

      const linkElement = article.querySelector("a.sa_text_title");
      if (linkElement) {
        const url = linkElement.getAttribute("href");
        const title = linkElement.textContent?.trim() || "";

        if (url && title) {
          results.push({ url, title });
        }
      }
    }

    return results;
  }, count);

  return newsLinks;
}

/**
 * 개별 뉴스 상세 정보 크롤링
 */
async function scrapeNewsDetail(page: Page, newsUrl: string, newsTitle: string, index: number): Promise<News> {
  // 뉴스 페이지 이동
  await page.goto(newsUrl, {
    waitUntil: "domcontentloaded",
  });

  // 뉴스 정보 추출
  const newsData = await page.evaluate(
    (url, title, maxLength) => {
      // 본문 추출
      const contentElement =
        document.querySelector("#dic_area") ||
        document.querySelector(".article_body") ||
        document.querySelector("article");
      let content = contentElement?.textContent?.trim() || "";

      // 본문 길이 제한
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + "...";
      }

      // 게시 시간 추출
      const timeElement =
        document.querySelector(".media_end_head_info_datestamp_time") || document.querySelector("span[data-date-time]");
      const publishedAt =
        timeElement?.getAttribute("data-date-time") || timeElement?.textContent?.trim() || new Date().toISOString();

      // 언론사 추출
      const sourceElement =
        document.querySelector(".media_end_head_top_logo img") || document.querySelector(".press_logo img");
      const source = sourceElement?.getAttribute("alt") || sourceElement?.getAttribute("title") || "알 수 없음";

      return {
        url,
        title,
        content,
        publishedAt,
        source,
      };
    },
    newsUrl,
    newsTitle,
    SCRAPER_CONFIG.MAX_CONTENT_LENGTH,
  );

  // 날짜 형식 변환 (ISO 8601)
  let publishedAt: string;
  try {
    publishedAt = new Date(newsData.publishedAt).toISOString();
  } catch {
    publishedAt = new Date().toISOString();
  }

  return {
    id: index + 1,
    title: newsData.title,
    content: newsData.content,
    url: newsData.url,
    publishedAt,
    source: newsData.source,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * 대기 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 네이버 뉴스 크롤링 메인 함수
 *
 * @param count 수집할 뉴스 개수 (기본값: 20)
 * @param onProgress 진행 상황 콜백 (선택)
 * @returns 수집된 뉴스 배열
 *
 * @example
 * const news = await scrapeNaverNews(20, (current, total) => {
 *   console.log(`${current}/${total} 진행 중...`);
 * });
 */
export async function scrapeNaverNews(
  count: number = 20,
  onProgress?: (current: number, total: number) => void,
): Promise<News[]> {
  let browser: Browser | null = null;

  try {
    console.log("브라우저 초기화 중...");
    browser = await initBrowser();

    console.log("페이지 설정 중...");
    const page = await setupPage(browser);

    console.log(`네이버 뉴스 목록 수집 중... (목표: ${count}개)`);
    const newsLinks = await extractNewsList(page, count);

    if (newsLinks.length === 0) {
      throw new Error("뉴스 목록을 찾을 수 없습니다.");
    }

    console.log(`${newsLinks.length}개 뉴스 발견. 상세 정보 수집 시작...`);

    const results: News[] = [];

    for (let i = 0; i < newsLinks.length; i++) {
      const { url, title } = newsLinks[i];

      try {
        console.log(`[${i + 1}/${newsLinks.length}] 크롤링 중: ${title.substring(0, 30)}...`);

        // 개별 뉴스 크롤링 (재시도 로직 포함)
        const newsData = await withRetry(async () => await scrapeNewsDetail(page, url, title, i), {
          maxRetries: 3,
          retryDelay: 1000,
          context: {
            type: "NAVER_NEWS_DETAIL",
            url,
          },
        });

        results.push(newsData);

        // 진행 상황 콜백 호출
        if (onProgress) {
          onProgress(i + 1, newsLinks.length);
        }

        // 서버 부하 방지를 위한 대기
        if (i < newsLinks.length - 1) {
          await sleep(SCRAPER_CONFIG.DELAY_BETWEEN_NEWS);
        }
      } catch (error) {
        console.error(`뉴스 크롤링 실패 [${i + 1}]: ${error}`);
        // 개별 뉴스 실패는 건너뛰고 계속 진행
        continue;
      }
    }

    console.log(`크롤링 완료: 총 ${results.length}개 수집`);

    return results;
  } catch (error) {
    console.error("네이버 뉴스 크롤링 실패:", error);
    throw error;
  } finally {
    // 브라우저 종료 (메모리 해제)
    if (browser) {
      await browser.close();
      console.log("브라우저 종료");
    }
  }
}

/**
 * 중복 뉴스 제거
 *
 * @param newsList 뉴스 배열
 * @returns 중복 제거된 뉴스 배열
 */
export function removeDuplicateNews(newsList: News[]): News[] {
  const seen = new Set<string>();
  const unique: News[] = [];

  for (const news of newsList) {
    if (!seen.has(news.url)) {
      seen.add(news.url);
      unique.push(news);
    }
  }

  return unique;
}
