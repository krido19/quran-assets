export function getHijriDate(date = new Date()) {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}
