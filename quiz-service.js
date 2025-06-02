// Quiz API Service
class QuizService {
    constructor() {
        this.apiUrl = "https://opentdb.com/api.php";
        this.categoriesUrl = "https://opentdb.com/api_category.php";
    }

    async getCategories() {
        try {
            const response = await fetch(this.categoriesUrl);
            const data = await response.json();
            return data.trivia_categories;
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    }

    async getQuestions(amount = 10, category = null, difficulty = null) {
        let url = `${this.apiUrl}?amount=${amount}&type=multiple`;
        
        if (category && category !== "any") {
            url += `&category=${category}`;
        }
        
        if (difficulty && difficulty !== "any") {
            url += `&difficulty=${difficulty}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.response_code === 0) {
                return data.results;
            } else {
                throw new Error("API response error: " + data.response_code);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            return [];
        }
    }
}
