/**
 * @typedef {Object} CharteProjet
 * @property {string} [nom]
 * @property {string} [description]
 * @property {string} [auteur]
 * @property {string} [reference]
 * @property {string} [date]
 */

/**
 * @typedef {Object} CharteSections
 * @property {boolean} [marque]
 * @property {boolean} [logo]
 * @property {boolean} [couleurs]
 * @property {boolean} [typographie]
 * @property {boolean} [kitUi]
 * @property {boolean} [elementsGraphiques]
 * @property {boolean} [aboutQwebty]
 */

/**
 * @typedef {Object} CharteConfig
 * @property {number} [version]
 * @property {CharteProjet} [projet]
 * @property {Object} [marque]
 * @property {Object} [couleurs]
 * @property {Object} [typographie]
 * @property {CharteSections} [sections]
 */

export {};
