import { validationSchema } from '@/helpers/validationSchema'
import Wrapper from '@/helpers/wrapper'
import vote from '@/services/vote'
import { Formik } from 'formik'
import { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'

type Poll = {
    count: number
    question: {
        quest: string
        opinion: boolean
        any: boolean
    }
    answers: string[]
}

export default function VotingPage() {
    const [poll, setPoll] = useState<Poll | null | 'none'>(null)
    const [isLoadingPoll, setIsLoadingPoll] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    async function getPoll() {
        setIsLoadingPoll(true)
        try {
            const data = await vote.getPoll()
            setPoll(() => {
                const q = data.question?.split('::')
                if (q)
                    return {
                        count: data.count,
                        question: {
                            quest: q?.[0],
                            opinion: JSON.parse(q?.[1]),
                            any: JSON.parse(q?.[2]),
                        },
                        answers: data.answers?.split('::'),
                    }
                return 'none'
            })
        } catch {
            setError('Проблемы с получением настроек голосования')
        } finally {
            setIsLoadingPoll(false)
        }
    }

    async function setPollOnServer(values: { question: string; answers: string; count: string }) {
        setIsLoadingPoll(true)
        try {
            await vote.setPoll(values)
        } catch {
            alert('Голосование не создано')
        } finally {
            setIsLoadingPoll(false)
        }
    }

    async function deletePoll() {
        setIsLoadingPoll(true)
        try {
            await vote.deletePoll()
        } catch {
            alert('Голосование не удалено')
        } finally {
            setIsLoadingPoll(false)
        }
    }

    useEffect(() => {
        getPoll()
    }, [])

    if (error) {
        return (
            <Wrapper>
                <h1 style={{ color: 'darkred' }}>{error}</h1>
            </Wrapper>
        )
    }

    if (isLoadingPoll)
        return (
            <Wrapper>
                <Spinner style={{ height: 100, width: 100 }} animation="grow" />
            </Wrapper>
        )

    function prepare(data: { question: string; answers: string[]; opinion: boolean; any: boolean; count: number }) {
        return {
            count: data.count.toString(),
            question: [data.question, data.opinion, data.any].join('::'),
            answers: data.answers.join('::'),
        }
    }

    if (poll == 'none' && !isLoadingPoll)
        return (
            <Container>
                <Formik
                    initialValues={{ question: '', answers: [] as string[], opinion: true, any: false, count: 4 }}
                    onSubmit={(e) => {
                        setPollOnServer(prepare(e)).then(getPoll)
                    }}
                    validateOnBlur
                    validationSchema={validationSchema}
                    validateOnMount
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, setFieldValue, isValid }) => {
                        return (
                            <div
                                onBlur={handleBlur}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    rowGap: 10,
                                }}
                            >
                                <Form.Group>
                                    <Form.Label>Введите вопрос для голосования</Form.Label>
                                    <Form.Control
                                        name="question"
                                        onChange={handleChange}
                                        value={values.question}
                                        isInvalid={!!errors.question}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.question}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Число участников голосования</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="count"
                                        onChange={handleChange}
                                        value={values.count}
                                        isInvalid={!!errors.count}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.count}</Form.Control.Feedback>
                                </Form.Group>
                                {values.answers.map((elem, index) => (
                                    <Form key={index}>
                                        <Form.Label style={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
                                            Вариант ответа {index + 1}
                                        </Form.Label>
                                        <Form.Control
                                            name={`answers.${index}`}
                                            value={values.answers[index]}
                                            onChange={handleChange}
                                            isInvalid={!!errors?.answers && !!errors.answers[index]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {!!errors?.answers && !!errors.answers[index] && errors.answers[index]}
                                        </Form.Control.Feedback>
                                    </Form>
                                ))}
                                <Row>
                                    <Col>
                                        <Button
                                            onClick={() => setFieldValue('answers', values.answers.concat(''))}
                                            disabled={!!errors.answers?.length}
                                        >
                                            Добавить вариант ответа
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button
                                            onClick={() => {
                                                if (values.answers.length - 1 == 0) setFieldValue('opinion', true)
                                                setFieldValue('answers', values.answers.slice(0, -1))
                                            }}
                                        >
                                            Удалить вариант ответа
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Form.Group>
                                        <Form.Check
                                            label="Свой вариант ответа"
                                            checked={values.opinion || !values.answers.length}
                                            onChange={handleChange}
                                            name="opinion"
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check
                                            disabled={!values.answers.length}
                                            label="Несколько вариантов ответа"
                                            checked={values.any}
                                            onChange={handleChange}
                                            name="any"
                                        />
                                    </Form.Group>
                                </Row>
                                <Row style={{ marginTop: 10 }}>
                                    <Button type="submit" onClick={() => handleSubmit()} disabled={!isValid}>
                                        Начать голосование
                                    </Button>
                                </Row>
                            </div>
                        )
                    }}
                </Formik>
            </Container>
        )

    if (poll != 'none' && poll)
        return (
            <Container>
                <h1>
                    <b>Вопрос: </b>
                    {poll.question.quest}
                </h1>
                <h4>
                    <b>Количество участников: </b>
                    {poll.count}
                </h4>
                <h4>
                    <b>Несколько вариантов ответа: </b>
                    {poll.question.any ? 'можно' : 'нельзя'}
                </h4>
                <h4>
                    <b>Свой вариант ответа: </b>
                    {poll.question.opinion ? 'можно' : 'нельзя'}
                </h4>
                {poll.answers.length > 0 && poll.answers[0] != '' && (
                    <>
                        <h1>Варианты ответа:</h1>
                        <ul>
                            {poll.answers.map((answer, index) => {
                                return (
                                    <li key={index}>
                                        <h4>{answer}</h4>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}

                <Button variant="danger" onClick={() => deletePoll().then(getPoll)}>
                    Сбросить настройки
                </Button>
            </Container>
        )
}
