// Vercel Serverless Function to Proxy requests to LMS Moodle API
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Parse the incoming URL
        const url = new URL(req.url, `http://${req.headers.host}`);

        // Vercel rewrite sends the original path (e.g., /lms-proxy/login/token.php)
        // We need to remove the /lms-proxy prefix to get the actual LMS path
        let targetPath = url.pathname;

        // Remove '/lms-proxy' prefix if present
        if (targetPath.startsWith('/lms-proxy')) {
            targetPath = targetPath.replace('/lms-proxy', '');
        }

        // Ensure path starts with /
        if (!targetPath.startsWith('/')) {
            targetPath = '/' + targetPath;
        }

        // Build target URL (without query params for now, will add later if GET)
        let targetUrl = `https://lms.psu.ac.th${targetPath}`;

        console.log('[Proxy] Method:', req.method);
        console.log('[Proxy] Original pathname:', url.pathname);
        console.log('[Proxy] Target path:', targetPath);
        console.log('[Proxy] Final Target URL:', targetUrl);

        // Prepare fetch options
        const fetchOptions = {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        };

        // Handle different request methods
        if (req.method === 'POST' || req.method === 'PUT') {
            // Get the content type from request
            const contentType = req.headers['content-type'] || 'application/x-www-form-urlencoded';
            fetchOptions.headers['Content-Type'] = contentType;

            // Forward the body
            if (req.body) {
                // If body is already a string (from URLSearchParams), use it directly
                if (typeof req.body === 'string') {
                    fetchOptions.body = req.body;
                } else if (typeof req.body === 'object') {
                    // Convert object to URLSearchParams format
                    const params = new URLSearchParams();
                    for (const [key, value] of Object.entries(req.body)) {
                        params.append(key, value);
                    }
                    fetchOptions.body = params.toString();
                }
                console.log('[Proxy] Request body:', fetchOptions.body);
            }
        } else if (req.method === 'GET') {
            // Append query string for GET requests
            // But filter out Vercel's internal 'match' parameter
            const queryString = url.search;
            if (queryString) {
                // Parse and filter query parameters
                const params = new URLSearchParams(queryString);
                params.delete('match'); // Remove Vercel's internal parameter

                const cleanQueryString = params.toString();
                if (cleanQueryString) {
                    targetUrl += '?' + cleanQueryString;
                    console.log('[Proxy] Added query string:', '?' + cleanQueryString);
                }
            }
        }

        // Forward the request to LMS Moodle server
        const response = await fetch(targetUrl, fetchOptions);

        // Get response data
        const responseContentType = response.headers.get('content-type');
        let data;

        if (responseContentType && responseContentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log('[Proxy] Response status:', response.status);
        console.log('[Proxy] Response preview:', JSON.stringify(data).substring(0, 200));

        // Return the proxied response
        if (typeof data === 'string') {
            // If response is HTML/text, try to parse as JSON or return error
            try {
                const jsonData = JSON.parse(data);
                return res.status(response.status).json(jsonData);
            } catch (e) {
                // Return as JSON object with the text
                return res.status(response.status).json({
                    error: 'Invalid response',
                    response: data,
                    status: response.status
                });
            }
        } else {
            return res.status(response.status).json(data);
        }

    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        console.error('[Proxy] Stack:', error.stack);
        return res.status(500).json({
            error: 'Proxy request failed',
            message: error.message,
            details: error.toString()
        });
    }
}
