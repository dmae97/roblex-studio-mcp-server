"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColor = exports.capitalizeFirstLetter = void 0;
/**
 * 문자열의 첫 글자를 대문자로 변환
 * @param str 변환할 문자열
 * @returns 첫 글자가 대문자로 변환된 문자열
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
/**
 * 색상 문자열을 RGB 값으로 파싱
 * @param color 색상 문자열 (예: "#ff0000" 또는 "255, 0, 0")
 * @returns 색상의 RGB 값이 포함된 문자열
 */
function parseColor(color) {
    // 색상 문자열이 이미 RGB 형식인 경우 그대로 반환
    if (color.includes(',')) {
        return color;
    }
    // HEX 형식(#rrggbb)인 경우 RGB로 변환
    if (color.startsWith('#')) {
        const hex = color.substring(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
    // 색상 이름이 주어진 경우 기본값 반환
    const colorMap = {
        "red": "255, 0, 0",
        "green": "0, 255, 0",
        "blue": "0, 0, 255",
        "yellow": "255, 255, 0",
        "cyan": "0, 255, 255",
        "magenta": "255, 0, 255",
        "black": "0, 0, 0",
        "white": "255, 255, 255",
        "gray": "128, 128, 128"
    };
    return colorMap[color.toLowerCase()] || "128, 128, 128"; // 기본값은 회색
}
exports.parseColor = parseColor;
//# sourceMappingURL=utils.js.map