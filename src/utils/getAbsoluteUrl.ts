import parse from 'url-parse';

export default function getAbsoluteUrl(url: string): string {
    const parseUrlObj: parse = parse(url);
    return `${parseUrlObj.origin}${parseUrlObj.pathname}`;
}
