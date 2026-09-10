(() => {
window.ChineseApp = window.ChineseApp || {};

function parseInput(text) {
    if (!text || !text.trim()) return [];
    
    // Split by spaces, commas, newlines, and common punctuation
    const items = text.split(/[\s,，、\n.。!！?？;；:：()（）"']+/).filter(item => item.trim().length > 0);
    
    return items.map(item => {
        return {
            text: item,
            isChinese: isChineseCharacter(item),
            isValid: isValidItem(item)
        };
    });
}

function isChineseCharacter(str) {
    return /^[\u4e00-\u9fff]+$/.test(str);
}

function isValidItem(str) {
    if (isChineseCharacter(str)) return true;
    if (/^[a-zA-ZāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜüÜ]+[1-5]?$/i.test(str)) return true;
    return false;
}

window.ChineseApp.parseInput = parseInput;
window.ChineseApp.isChineseCharacter = isChineseCharacter;
window.ChineseApp.isValidItem = isValidItem;

})();
