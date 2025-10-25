interface UrlMatch {
    [index: number]: string;
}

export function getGeneratedString(url: string): string {
    // This regex captures one or more characters that are not "/"
    // immediately following "/generated/".
    const regex = /\/generated\/([^/]+)/;
    const match: UrlMatch | null = url.match(regex);
    return match ? match[1] : "";
}