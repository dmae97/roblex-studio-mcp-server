export declare const socialFeaturesGenerator: {
    name: string;
    description: string;
    parameters: {
        type: string;
        required: string[];
        properties: {
            featureType: {
                type: string;
                enum: string[];
                description: string;
            };
            complexity: {
                type: string;
                enum: string[];
                description: string;
            };
            userInterface: {
                type: string;
                description: string;
            };
            serverSide: {
                type: string;
                description: string;
            };
            clientSide: {
                type: string;
                description: string;
            };
            dataStorage: {
                type: string;
                description: string;
            };
        };
    };
    execute: (params: any) => Promise<{
        scripts: any[];
        uiElements: {
            name: string;
            preview: string;
            description: string;
        }[];
        dataModel: {
            schema: {
                tableName: string;
                fields: {
                    name: string;
                    type: string;
                    description: string;
                }[];
            };
            migrations: {
                version: string;
                description: string;
                script: string;
            }[];
        };
        documentation: {
            setup: string;
            usage: string;
            examples: string[];
        };
    }>;
};
