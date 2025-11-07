/**
 * 크롤링 중복 실행 방지 Lock
 *
 * 전역 singleton으로 동작하며, 동시에 하나의 크롤링만 허용합니다.
 */

class ScraperLock {
  private static instance: ScraperLock;
  private isLocked = false;
  private lockTime = 0;
  private readonly LOCK_TIMEOUT = 5 * 60 * 1000; // 5분

  private constructor() {}

  public static getInstance(): ScraperLock {
    if (!ScraperLock.instance) {
      ScraperLock.instance = new ScraperLock();
    }
    return ScraperLock.instance;
  }

  /**
   * Lock 획득 시도
   * @returns 성공 여부
   */
  public tryAcquire(): boolean {
    // 타임아웃 체크
    if (this.isLocked && Date.now() - this.lockTime > this.LOCK_TIMEOUT) {
      console.warn("⚠️ Lock timeout - 강제 해제");
      this.release();
    }

    if (this.isLocked) {
      return false;
    }

    this.isLocked = true;
    this.lockTime = Date.now();
    return true;
  }

  /**
   * Lock 해제
   */
  public release(): void {
    this.isLocked = false;
    this.lockTime = 0;
  }

  /**
   * Lock 상태 확인
   */
  public isAcquired(): boolean {
    return this.isLocked;
  }
}

export const scraperLock = ScraperLock.getInstance();
