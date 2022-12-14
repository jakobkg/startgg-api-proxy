declare type StartggResponse = {
    data: {
        phaseGroup: {
            bracketType: string,
            sets: {
                pageInfo: {
                    page: number,
                    totalPages: number
                },
                nodes: SetNode[]
            }
        }
    },
    extensions: object,
    actionRecords: [object]
};

declare type SetNode = {
    fullRoundText: string,
    slots: [{
        entrant: {
            name: string
        },
        standing: {
            stats: {
                score: {
                    value: number
                }
            }
        }
    }]
};