import Wrapper from '@/helpers/wrapper'
import connect from '@/services/connect'
import { useEffect, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'

type Status = { stage: string; active: string; error?: string }

export default function ViewPage() {
    const [status, setStatus] = useState<Status | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showOk, setShowOk] = useState<boolean>(false)

    const [ip, setIp] = useState<string | null>(null)
    const [isLoadingIp, setIsLoadingIp] = useState<boolean>(false)

    async function getIpAddress() {
        setIsLoadingIp(true)
        try {
            const response = await connect.connect()
            if (response) setIp(response)
            else setError('Вы не подключены к локальной сети')
        } catch {
            setError('Нет подключения к серверу')
        } finally {
            setIsLoadingIp(false)
        }
    }

    useEffect(() => {
        getIpAddress()
    }, [])

    useEffect(() => {
        if (status?.error) setError(status.error)
    }, [status])

    useEffect(() => {
        try {
            const sse = new EventSource(`https://localhost:5000/status`)
            sse.onmessage = (e) => {
                try {
                    setStatus(JSON.parse(e.data))
                } catch {}
            }
            sse.onerror = () => {
                sse.close()
                setError('Соединение разорвано')
            }
            return () => {
                sse.close()
            }
        } catch {
            setError('Нет подключения к серверу')
        }
    }, [])

    if (!status && !error) {
        return (
            <Wrapper>
                <Spinner style={{ height: 100, width: 100 }} animation="grow" />
            </Wrapper>
        )
    }
    if (error) {
        return (
            <Wrapper>
                <h1 style={{ color: 'darkred' }}>{error}</h1>
            </Wrapper>
        )
    }
    return (
        <>
            <Form.Label
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={() => {
                    if (ip) {
                        navigator.clipboard.writeText(ip)
                        setShowOk(true)
                        setTimeout(() => setShowOk(false), 1000)
                    }
                }}
            >
                <b>{'IP aдрес для подключения: '}</b>
                {isLoadingIp ? <Spinner /> : ip}
                {showOk ? '✔' : ''}
            </Form.Label>
            <Wrapper>
                <div>
                    <h1 style={{ color: 'darkslateblue' }}>
                        {(() => {
                            if (!status) return
                            const [current, count] = status.active.split('/').map((i) => Number(i))
                            switch (status.stage) {
                                case 'none':
                                    return 'Голосование ещё не началось'
                                case 'init':
                                    return `Регистрация на голосование: ${status.active}`
                                case 'active':
                                    return `Проголосовали: ${status.active}`
                                case 'decrypt':
                                    return `Расшифровывает: ${status.active}`
                                case 'sign':
                                    if (current <= count) return `Подписывает: ${status.active}`
                                    else return `1-ый проверяет подпись`
                                case 'ended':
                                    return 'Голосование окончено'
                            }
                        })()}
                    </h1>
                </div>
            </Wrapper>
        </>
    )
}
