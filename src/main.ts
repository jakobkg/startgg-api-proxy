import { ClientRequest } from './clientRequest';
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
        "This proxy is intended to use by sending a POST request with the ID of the bracket you'd like data for. For further instructions, see the GitHub repository at ASDF",
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
        requestBody.phaseId;
    } catch (error) {
        requestBody = { phaseId: -1 };
    }

    const phase = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // @ts-ignore
            Authorization: `Bearer ${STARTGG_API_KEY}`,
        },
        body: JSON.stringify({
            query: query,
            variables: {
                phaseId: requestBody.phaseId,
            },
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    });

    return new Response(JSON.stringify(phase), {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
