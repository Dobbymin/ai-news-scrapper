interface Response {
  success: boolean;
  data: {
    investmentIndex: number;
    totalNews: number;
    date: string;
  };
  error?: string;
}

export const fetchLatestAnalysis = async (): Promise<Response | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://ai-news-scrapper.vercel.app"}/api/crypto-news/raw?type=analysis&date=latest`,
      { next: { revalidate: 300 } },
    );
    const json = await res.json();
    if (json.success) {
      return {
        success: json.success,
        data: {
          investmentIndex: json.data.investmentIndex,
          totalNews: json.data.totalNews,
          date: json.data.date,
        },
      };
    }
  } catch (e) {
    return null;
  }
  return null;
};
