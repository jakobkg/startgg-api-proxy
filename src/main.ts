import { query } from './query';

addEventListener('fetch', (event: FetchEvent) => {
    switch (event.request.method) {
        case 'OPTIONS':
            event.respondWith(handleOptionsRequest());
            break;

        case 'POST':
            event.respondWith(handlePostRequest(event.request));
            break;

        case 'GET':
            event.respondWith(handleGetRequest());
            break;

        default:
            event.respondWith(
                new Response('Unexpected request type', { status: 400 }),
            );
            break;
    }
});

/**
 * OPTIONS request handler
 * @returns a Promise of a Response with the correct CORS headers
 */
async function handleOptionsRequest(): Promise<Response> {
    return new Response('', {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type, accept',
        },
    });
}

/**
 * GET request handler
 * @returns a Promise of a Response with the correct CORS headers
 */
async function handleGetRequest(): Promise<Response> {
    return new Response(
        "This proxy is intended to use by sending a POST request with the ID of the bracket you'd like data for. For further instructions, see the GitHub repository at https://github.com/jakobkg/startgg-api-proxy",
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'content-type, accept',
            },
        },
    );
}

/**
 * POST request handler
 * @param request the POST request to respond to
 * @returns a Promise of a Response, forwarding an API response from Start.gg
 */
async function handlePostRequest(request: Request): Promise<Response> {
    let requestBody: ClientRequest;
    try {
        requestBody = await request.json();

        // Some basic validations, no need to query the start.gg API if we know the query isn't valid

        if (requestBody.groupId === null || isNaN(requestBody.groupId)) {
            throw new Error("No groupId provided");
        }

        if (requestBody.groupId < 0) {
            throw new Error("Invalid groupId value");
        }
    } catch (error) {
        console.log(request);
        return new Response(
            JSON.stringify({ error: "Invalid request, missing or invalid groupId" }), {
            status: 400,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }
        )
    }

    let currentPage = 1;
    let totalPages = -1;

    let nodes: SetNode[] | null = null;
    let phase: StartggResponse;

    do {
        phase = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                // @ts-ignore This is the API key that should be stored as a project secret
                Authorization: `Bearer ${STARTGG_API_KEY}`,
            },
            body: JSON.stringify({
                query: query,
                variables: {
                    groupId: requestBody.groupId,
                    page: currentPage,
                    perPage: 25
                },
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                return data as StartggResponse;
            });

        if (totalPages == -1) { totalPages = phase.data.phaseGroup.sets.pageInfo.totalPages; }

        if (nodes === null) {
            nodes = phase.data.phaseGroup.sets.nodes;
        } else {
            nodes = nodes.concat(phase.data.phaseGroup.sets.nodes);
        }

        currentPage++;
    } while (totalPages == -1 || currentPage <= totalPages)

    phase.data.phaseGroup.sets.nodes = nodes;

    return new Response(JSON.stringify(phase), {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
