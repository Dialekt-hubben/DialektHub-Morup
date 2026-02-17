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
        userName: string | null,
        nationalWord: string | null,
        soundFileUrl: string | null,
    }>;
    error?: string,
};

export type { DialectWordTableResponse };