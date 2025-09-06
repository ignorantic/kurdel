import { IncomingMessage, ServerResponse } from 'http';
export declare function createReqRes(url?: string, method?: string): {
    req: IncomingMessage;
    res: ServerResponse<IncomingMessage>;
    getResult: () => {
        statusCode: number;
        headers: Record<string, string>;
        body: string;
    };
};
