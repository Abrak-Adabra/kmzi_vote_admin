export default class connect {
    public static async connect() {
        const url = 'http://localhost:5000/connect'
        const response = await fetch(url, {
            method: 'GET',
        })
        return response.ok ? await response.text() : false
    }
}
