const DATA = require("../country-names.json") as {
  countryNames: { [language: string]: { [country: string]: string } };
  country: { [country: string]: string };
};

export function countryName(country: string, language: string) {
  country = country.toUpperCase();
  if (DATA.countryNames[language][country] !== null) {
    return DATA.countryNames[language][country];
  }

  const key = DATA.country[country];
  return DATA.countryNames[language][key];
}
