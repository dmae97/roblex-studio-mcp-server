export declare const localizationManager: {
    name: string;
    description: string;
    parameters: {
        type: string;
        required: string[];
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            gameId: {
                type: string;
                description: string;
            };
            sourceLanguage: {
                type: string;
                description: string;
            };
            targetLanguages: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
        };
    };
    execute: (params: any) => Promise<{}>;
};
