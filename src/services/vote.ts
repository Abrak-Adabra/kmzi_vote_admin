export default class vote {
    public static async getPoll() {
        const url = 'https://localhost:5000/poll'
        const response = await fetch(url, {
            method: 'GET',
        })
        return await response.json()
    }
    public static async setPoll(data: { count: string; question: string; answers: string }) {
        const url = 'https://localhost:5000/poll'
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        })
        return await response.text()
    }
    public static async deletePoll() {
        const url = 'https://localhost:5000/poll'
        const response = await fetch(url, {
            method: 'DELETE',
        })
        return await response.text()
    }
}
