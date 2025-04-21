import * as Yup from 'yup'

export const validationSchema = Yup.object().shape({
    question: Yup.string().nonNullable().required('Вопрос должен быть не пустым'),
    count: Yup.number().integer('Число должно быть целым').min(4, 'Число должно быть > 3'),
    answers: Yup.array().of(Yup.string().nonNullable().required('Вариант ответа не должен быть пустым')),
})
