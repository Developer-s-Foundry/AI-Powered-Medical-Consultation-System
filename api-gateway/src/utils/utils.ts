import { routes } from './types';
import { Request} from "express";
import { AppError } from '../custom-error/error';
import jwt from 'jsonwebtoken'



export const processHeader = (req: Request) => {
    const headers = Object.fromEntries( Object.entries(req.headers).filter(([_, value]) => typeof value === 'string')) as Record<string, string>;
    delete headers['host'];

    //create a jwt signature
    if (!process.env.GATEWAY_SECRET) {
       throw new AppError('env variable not found', 404);
         
    }
    const gatewayToken = jwt.sign({service: "gateway"}, 
        process.env.GATEWAY_SECRET, {
            expiresIn: '5m'
        })
    headers['x-gateway-signature'] = gatewayToken;
    return headers
}


export const matchRoute = (pathname: string, routes: routes[]) => {
    for (const route of routes) {
        const matchedRoute = matchPattern(pathname, route.pattern);
        if (matchedRoute?.matched) {
            return {
                host: route.upstream, path: pathname
            }
        }
    }
    return null;
}

const matchPattern = (path: string, pattern: string) => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    const patternPath = pattern.slice(0, -2);

    if(path.startsWith(patternPath)) {
        return {matched: true}
    } 

    if (pathParts.length !== patternParts.length) {
         return {
            matched: false
        }
    }
}

export const forwardRequest = async (targetUrl: string, method: string, headers: Record<string, string>, body?: any) => {
    const response = await fetch(targetUrl, {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(body)
    })
    if (!response.ok) {
        throw new AppError('bad response', response.status)
    }
    return {data: await response.json(), status: response.status};
}