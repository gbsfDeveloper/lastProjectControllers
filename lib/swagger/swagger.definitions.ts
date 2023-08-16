/**
 * @swagger
 *
 * components:
 *
 *  responses:
 *
 *    ok:
 *      description: Status ok
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             status:
 *              type: string
 *              example: ok
 *
 *    401-invalid-credentials:
 *      description: Incorrect authentication
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             status:
 *              type: string
 *              example: error
 *             message:
 *              type: string
 *              example: Invalid credentials
 *
 *    401-unauthorized:
 *      description: You don't have an access token.
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             status:
 *              type: string
 *              example: error
 *             message:
 *              type: string
 *              example: "Auth Header: No token provided"
 *
 *    404:
 *      description: Not found
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             status:
 *               type: string
 *               example: 404
 *             message:
 *               type: string
 *               example: Not found.
 *  data:
 *    page:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        pageNumber:
 *          type: string
 *        problem:
 *          type: array
 *          items:
 *              $ref: '#/components/data/problem'
 *    problem:
 *      type: object
 *      properties:
 *        problem_id:
 *          type: string
 *        problemTitle:
 *          type: string
 *        problemContent:
 *          type: string
 *        problemImage:
 *          type: string
 *        problemOrder:
 *          type: number
 *        answer:
 *          type: array
 *          items:
 *            $ref: '#/components/data/answer'
 *    answer:
 *      type: object
 *      properties:
 *        answer_id:
 *          type: string
 *        answerContent:
 *          type: string
 *        answerImage:
 *          type: string
 *        relatedStepbyStep:
 *          type: string
 *          example: this is really an array of strings but for swagger performance reasons we cannot nest this many times in a document
 *
 *
 *
 */
