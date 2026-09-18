export function numberToEnglishWords(num: number): string {
  if (num === 0) return 'ZERO BIRR AND ZERO CENTS';
  const birr = Math.floor(num);
  const cents = Math.round((num - birr) * 100);
  const ones = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const tens = [
    '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
  ];

  const conv = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' AND ' + conv(n % 100) : '');
    if (n < 1e6) return conv(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 ? ' ' + conv(n % 1000) : '');
    if (n < 1e9) return conv(Math.floor(n / 1e6)) + ' MILLION' + (n % 1e6 ? ' ' + conv(n % 1e6) : '');
    return n.toString();
  };

  return conv(birr) + ' BIRR' + (cents > 0 ? ' AND ' + conv(cents) + ' CENTS' : ' AND ZERO CENTS');
}

export function numberToAmharicWords(num: number): string {
  if (num === 0) return 'ዜሮ ብር እና ዜሮ ሳንቲም';
  const birr = Math.floor(num);
  const cents = Math.round((num - birr) * 100);
  const ones = [
    '', 'አንድ', 'ሁለት', 'ሶስት', 'አራት', 'አምስት', 'ስድስት', 'ሰባት', 'ስምንት', 'ዘጠኝ',
    'አስር', 'አስራ አንድ', 'አስራ ሁለት', 'አስራ ሶስት', 'አስራ አራት', 'አስራ አምስት',
    'አስራ ስድስት', 'አስራ ሰባት', 'አስራ ስምንት', 'አስራ ዘጠኝ'
  ];
  const tens = [
    '', '', 'ሃያ', 'ሰላሳ', 'አርባ', 'ሃምሳ', 'ስድሳ', 'ሰባ', 'ሰማንያ', 'ዘጠና'
  ];

  const conv = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' መቶ' + (n % 100 ? ' ' + conv(n % 100) : '');
    if (n < 1e6) return conv(Math.floor(n / 1000)) + ' ሺህ' + (n % 1000 ? ' ' + conv(n % 1000) : '');
    if (n < 1e9) return conv(Math.floor(n / 1e6)) + ' ሚሊዮን' + (n % 1e6 ? ' ' + conv(n % 1e6) : '');
    return n.toString();
  };

  return conv(birr) + ' ብር' + (cents > 0 ? ' እና ' + conv(cents) + ' ሳንቲም' : ' እና ዜሮ ሳንቲም');
}

export function formatETB(n: number): string {
  return 'ETB ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNum(n: number): string {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
