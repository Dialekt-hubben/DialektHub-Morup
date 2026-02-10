// TypeScript interface for the API response
type DialectWordTableResponse = {
    paginationOffset: number,
    page: number,
    paginationSize: number,
    total: number,
    data: Array<{
        id: number,
        word: string,
        pronunciation: string,
        phrase: string,
        status: "pending" | "approved" | "rejected",
        userName: string,
        nationalWord: string,
        soundFileUrl: string,
    }>;
    error?: string,
};

export type { DialectWordTableResponse };