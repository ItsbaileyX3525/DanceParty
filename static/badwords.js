class Filter {
	constructor(options = {}) {
		// options.list is an array of extra bad words
		// options.localList and options.baseList are arrays of words to combine
		// If not provided, empty lists are used

		const localList = options.localList || [];
		const baseList = options.baseList || [];

		this.list = options.emptyList
			? []
			: [].concat(localList, baseList, options.list || []);

		this.exclude = options.exclude || [];
		this.splitRegex = options.splitRegex || /\b/;
		this.placeHolder = options.placeHolder || "*";
		this.regex = options.regex || /[^a-zA-Z0-9|\$|\@]|\^/g;
		this.replaceRegex = options.replaceRegex || /\w/g;
	}

	isProfane(text) {
		return this.list.some(word => {
			if (this.exclude.includes(word.toLowerCase())) return false;
			const regex = new RegExp(`\\b${word.replace(/(\W)/g, "\\$1")}\\b`, "gi");
			return regex.test(text);
		});
	}

	replaceWord(word) {
		return word.replace(this.regex, "").replace(this.replaceRegex, this.placeHolder);
	}

	clean(text) {
		// This split-join approach keeps original separators
		const parts = text.split(this.splitRegex);
		const separators = text.match(this.splitRegex) || [];

		let result = "";
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			result += this.isProfane(part) ? this.replaceWord(part) : part;
			if (i < separators.length) result += separators[i];
		}
		return result;
	}

	addWords(...words) {
		this.list.push(...words);
		words.map(w => w.toLowerCase()).forEach(w => {
			const idx = this.exclude.indexOf(w);
			if (idx > -1) this.exclude.splice(idx, 1);
		});
	}

	removeWords(...words) {
		this.exclude.push(...words.map(w => w.toLowerCase()));
	}
}

// Expose to global scope for browsers
window.Filter = Filter;
