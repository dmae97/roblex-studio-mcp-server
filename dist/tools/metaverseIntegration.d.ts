export declare const metaverseIntegration: {
    name: string;
    description: string;
    parameters: {
        type: string;
        required: string[];
        properties: {
            integrationType: {
                type: string;
                enum: string[];
                description: string;
            };
            platforms: {
                type: string;
                items: {
                    type: string;
                    enum: string[];
                };
                description: string;
            };
            assetTypes: {
                type: string;
                items: {
                    type: string;
                    enum: string[];
                };
                description: string;
            };
            securityLevel: {
                type: string;
                enum: string[];
                description: string;
            };
            customPlatform: {
                type: string;
                description: string;
            };
        };
    };
    execute: (params: any) => Promise<{
        integrationCode: {
            serverComponents: {
                name: string;
                content: string;
            }[];
            clientComponents: {
                name: string;
                content: string;
            }[];
        };
        configuration: {
            description: string;
            platforms: any;
            assetTypes: any;
            securityLevel: any;
            endpoints: {
                auth: string;
                profile: string;
                assets: string;
            } | {
                assets: string;
                inventory: string;
                marketplace: string;
            } | {
                events: string;
                calendar: string;
                participation: string;
            } | {
                audio: string;
                voice: string;
                spatial: string;
            } | {
                auth: string;
                identity: string;
                permissions: string;
            };
            webhooks: {
                userSync: string;
                assetSync: string;
                eventSync: string;
            } | {
                assetTransfer: string;
                purchaseComplete: string;
                inventoryUpdate: string;
            } | {
                eventCreated: string;
                eventUpdated: string;
                eventJoined: string;
            } | {
                voiceChannelJoined: string;
                audioStateChanged: string;
                spatialSettingsUpdated: string;
            } | {
                userAuthorized: string;
                permissionsChanged: string;
                sessionExpired: string;
            };
            security: {
                encryption: string;
                authentication: string;
                rateLimit: string;
                description: string;
            };
        };
        documentation: {
            setup: string;
            apiReference: string;
            securityGuidelines: string;
        };
    }>;
};
