import { useEffect, useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import VotingPage from './voting'
import ViewPage from './view'

export default function MainPage() {
    const [mode, setMode] = useState<'vote' | 'view'>('view')

    useEffect(() => {
        const previousMode = localStorage.getItem('mode')
        if (previousMode) setMode(previousMode as 'vote' | 'view')
    }, [])

    return (
        <Container
            style={{ display: 'flex', flexDirection: 'column', rowGap: '20px', paddingBlock: '20px', height: '100%' }}
        >
            {mode && (
                <Button
                    variant="dark"
                    onClick={() => {
                        setMode((cur) => {
                            const mode = cur == 'vote' ? 'view' : 'vote'
                            localStorage.setItem('mode', mode)
                            return mode
                        })
                    }}
                >
                    {mode == 'vote' ? 'Посмотреть процесс' : 'Настроить голосование'}
                </Button>
            )}
            {mode == 'vote' && <VotingPage />}
            {mode == 'view' && <ViewPage />}
        </Container>
    )
}
