import puppeteer, { Browser, Page } from "puppeteer";

import { News } from "@/entities/news";

import { withRetry } from "@/shared/api/error-handler";

/**
 * 블록미디어 뉴스 크롤러
 *
 * Puppeteer를 사용하여 blockmedia.co.kr/featured-news 페이지에서
 * 코인 및 블록체인 관련 뉴스를 크롤링합니다.
 */

/**
 * 크롤링 설정
 */
const SCRAPER_CONFIG = {
  /** 블록미디어 메인 페이지 URL */
  BASE_URL: "https://www.blockmedia.co.kr/",

  /** User-Agent (봇 차단 우회) */
  USER_AGENT:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

  /** 페이지 로드 타임아웃 (ms) */
  TIMEOUT: 30000,

  /** 각 뉴스 크롤링 간격 (ms) */
  DELAY_BETWEEN_NEWS: 1000, // 2초 → 1초로 단축

  /** 본문 최대 길이 */
  MAX_CONTENT_LENGTH: 300,
};

/**
 * 브라우저 초기화
 */
async function initBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: true,
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
    waitUntil: "networkidle2", // domcontentloaded → networkidle2로 변경
    timeout: SCRAPER_CONFIG.TIMEOUT,
  });

  // 페이지가 완전히 로드될 때까지 추가 대기
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 뉴스 링크 추출 (블록미디어 메인 페이지 구조)
  const newsLinks = await page.evaluate((targetCount) => {
    const results: Array<{ url: string; title: string }> = [];
    const seenUrls = new Set<string>(); // 중복 URL 체크용

    // article.l-post 태그에서 뉴스 추출
    const articles = Array.from(document.querySelectorAll("article.l-post"));
    console.log(`발견된 article 개수: ${articles.length}`);

    for (const article of articles) {
      if (results.length >= targetCount) break;

      // h2.post-title 안의 a 태그에서 제목과 URL 추출
      const titleLink = article.querySelector("h2.post-title a");

      if (titleLink) {
        const url = titleLink.getAttribute("href");
        const title = titleLink.textContent?.trim() || "";

        // URL이 있고, archives 링크이며, 중복되지 않은 경우만 추가
        if (url && title && url.includes("/archives/") && !seenUrls.has(url)) {
          seenUrls.add(url);
          results.push({ url, title });
        }
      }
    }

    console.log(`중복 제거 후: ${results.length}개`);
    return results;
  }, count);

  console.log(`📋 총 ${newsLinks.length}개의 뉴스 링크 추출 완료`);
  return newsLinks;
}

/**
 * 개별 뉴스 상세 정보 추출
 */
async function extractNewsDetail(
  page: Page,
  newsItem: { url: string; title: string },
  index: number,
): Promise<News | null> {
  try {
    await page.goto(newsItem.url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // 본문과 메타 정보 추출
    const newsData = await page.evaluate(() => {
      // 본문 추출
      const contentElement = document.querySelector("div.entry-content");
      let content = "";
      if (contentElement) {
        // p 태그들의 텍스트만 추출
        const paragraphs = Array.from(contentElement.querySelectorAll("p"));
        content = paragraphs
          .map((p) => p.textContent?.trim())
          .filter((text) => text && text.length > 0)
          .join(" ");
      }

      // 게시 시간 추출
      const timeElement = document.querySelector("time.entry-date");
      const publishedAt = timeElement?.getAttribute("datetime") || new Date().toISOString();

      // 언론사 (블록미디어 고정)
      const source = "블록미디어";

      return {
        content,
        publishedAt,
        source,
      };
    });

    // 본문 길이 제한
    const trimmedContent =
      newsData.content.length > SCRAPER_CONFIG.MAX_CONTENT_LENGTH
        ? newsData.content.slice(0, SCRAPER_CONFIG.MAX_CONTENT_LENGTH) + "..."
        : newsData.content;

    const news: News = {
      id: index + 1,
      title: newsItem.title,
      content: trimmedContent || "본문 내용을 가져올 수 없습니다.",
      url: newsItem.url,
      publishedAt: newsData.publishedAt,
      source: newsData.source,
      scrapedAt: new Date().toISOString(),
    };

    console.log(`✅ [${index + 1}] ${newsItem.title.slice(0, 30)}...`);
    return news;
  } catch (error) {
    console.error(`❌ [${index + 1}] 뉴스 크롤링 실패:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 딜레이 함수
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 블록미디어 뉴스 크롤링 (메인 함수)
 * @param count 크롤링할 뉴스 개수 (기본 20)
 * @returns 크롤링된 뉴스 배열
 */
export async function scrapeBlockmediaNews(count: number = 20): Promise<News[]> {
  console.log("\n🚀 블록미디어 뉴스 크롤링 시작");
  console.log("━".repeat(50));

  let browser: Browser | null = null;

  try {
    // 브라우저 초기화
    browser = await initBrowser();
    const page = await setupPage(browser);

    // 1단계: 뉴스 목록 추출
    console.log(`\n📰 1단계: 뉴스 목록 추출 (목표: ${count}개)`);
    const newsLinks = await extractNewsList(page, count);

    if (newsLinks.length === 0) {
      console.warn("⚠️  추출된 뉴스가 없습니다.");
      return [];
    }

    // 2단계: 각 뉴스 상세 정보 크롤링
    console.log(`\n📝 2단계: 뉴스 상세 정보 크롤링`);
    const newsArray: News[] = [];

    for (let i = 0; i < newsLinks.length; i++) {
      const newsItem = newsLinks[i];
      const news = await extractNewsDetail(page, newsItem, i);

      if (news) {
        newsArray.push(news);
      }

      // 다음 뉴스 크롤링 전 딜레이
      if (i < newsLinks.length - 1) {
        await delay(SCRAPER_CONFIG.DELAY_BETWEEN_NEWS);
      }
    }

    console.log("\n━".repeat(50));
    console.log(`✅ 크롤링 완료: 총 ${newsArray.length}개 뉴스 수집`);

    return newsArray;
  } catch (error) {
    console.error("❌ 크롤링 중 오류 발생:", error);
    throw error;
  } finally {
    // 브라우저 종료
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 중복 뉴스 제거
 * @param news 뉴스 배열
 * @returns 중복이 제거된 뉴스 배열
 */
export function removeDuplicateCryptoNews(news: News[]): News[] {
  const seen = new Set<string>();
  const unique: News[] = [];

  for (const item of news) {
    // URL 기준으로 중복 체크
    if (!seen.has(item.url)) {
      seen.add(item.url);
      unique.push(item);
    }
  }

  const removedCount = news.length - unique.length;
  if (removedCount > 0) {
    console.log(`🔄 중복 제거: ${removedCount}개 제거됨 (${unique.length}개 유지)`);
  }

  return unique;
}

/**
 * 재시도 로직이 적용된 크롤링 함수
 * @param count 크롤링할 뉴스 개수
 */
export async function scrapeBlockmediaNewsWithRetry(count: number = 20): Promise<News[]> {
  return withRetry(() => scrapeBlockmediaNews(count), {
    maxRetries: 3,
    retryDelay: 2000,
  });
}
