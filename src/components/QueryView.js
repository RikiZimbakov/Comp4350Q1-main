import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, Typography, makeStyles, Box } from '@material-ui/core';

const useStyles = makeStyles({
    date: {
        marginBottom: 12,
    },
    comments: {
        'background-color': '#e6e5e7',
        'margin-left': '75px',
    },
    answers: {
        'border': 'none',
        'margin-left': '25px',
    },
    answerComments: {
        'background-color': '#87CEFA',
        'margin-left': '75px',
    },
    provider: {
        fontSize: 14,
    },
    card: {
        borderStyle: "ridge",
    }
});

const decodeHTML = html => {
    var text = document.createElement('textarea');
    text.innerHTML = html;
    return text.value;
};

const QueryView = props => {
    const classes = useStyles();

    const [answers, setAnswers] = useState([]);
    const [comments, setComments] = useState([]);
    const [questText, setQuestText] = useState('');

    const [collapse, setCollapse] = useState(true);
    const doCollapse = () => {
        setCollapse(!collapse);
    };

    useEffect(() => {
        const retrieveQuestInfo = async () => {
            if (!collapse) {
                const Http = new XMLHttpRequest();
                const url = `https://api.stackexchange.com/2.2/questions/${props.question_id}?order=desc&sort=votes&site=stackoverflow&filter=!)rTkraPYPWw39)()ir25`;
                Http.open("GET", url);
                Http.send();

                Http.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var json = JSON.parse(Http.responseText);
                        const question = json.items[0];

                        if (question.answers)
                            question.answers.sort((firstRes, SecRes) =>
                                firstRes.creation_date <= SecRes.creation_date ? 1 : -1
                            );
                        if (question.comments)
                            question.comments.sort((firstRes, SecRes) =>
                                firstRes.creation_date >= SecRes.creation_date ? 1 : -1
                            );
                        setAnswers(question.answers ? question.answers : []);
                        setComments(question.comments ? question.comments : []);
                        setQuestText(decodeHTML(question.body_markdown));
                    }
                }
            }
        };
        retrieveQuestInfo();
    }, [props, collapse]);

    return (
        <Box p={1}>
            <Card onClick={doCollapse}>
                <CardContent>
                    <Typography color="primary" className={classes.provider}>
                        {new Date(props.creation_date * 1000).toLocaleString()}
                    </Typography>
                    <Typography variant="h5">{decodeHTML(props.title)}</Typography>
                    <ReactMarkdown>{!collapse ? questText : null}</ReactMarkdown>
                    <Typography
                        className={
                            classes.date
                        }>{`votes => ${props.votes}`}</Typography>
                </CardContent>

                <Card>
                    {!collapse
                        ? comments.map((comment, i) => {
                            return (
                                <Box p={.5}>
                                    <Card
                                        variant="outlined"
                                        className={classes.comments}
                                        key={i}>
                                        <CardContent>
                                            <Typography color="primary">
                                                {new Date(
                                                    comment.creation_date * 1000
                                                ).toLocaleString()}
                                            </Typography>
                                            <ReactMarkdown>
                                                {decodeHTML(comment.body_markdown)}
                                            </ReactMarkdown>
                                            <Typography
                                                variant="caption"
                                                className={
                                                    classes.date
                                                }>{`votes => ${comment.score}`}</Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            );
                        })
                        : null}
                </Card>
                <Card>
                    {!collapse
                        ? answers.map((comment, index) => {
                            let subcomments = null;
                            if (comment.hasOwnProperty('comments')) {
                                subcomments = comment.comments;
                                subcomments.sort((firstRes, SecRes) =>
                                    firstRes.creation_date <= SecRes.creation_date ? 1 : -1
                                );
                            }
                            return (
                                <Card
                                    variant="outlined"
                                    className={classes.answers}
                                    key={index}>
                                    <CardContent>
                                        <Typography color="primary">
                                            {new Date(
                                                comment.creation_date * 1000
                                            ).toLocaleString()}
                                        </Typography>
                                        <ReactMarkdown>
                                            {decodeHTML(comment.body_markdown)}
                                        </ReactMarkdown>
                                        <Typography
                                            variant="caption"
                                            className={
                                                classes.date
                                            }>{`votes => ${comment.score}`}</Typography>
                                    </CardContent>
                                    {subcomments
                                        ? subcomments.map((subcomment, index) => {
                                            return (
                                                <Box p={.5}>
                                                    <Card
                                                    variant="outlined"
                                                    className={classes.answerComments}
                                                    key={index}>
                                                    <CardContent>
                                                        <Typography color="primary">
                                                            {new Date(
                                                                subcomment.creation_date *
                                                                1000
                                                            ).toLocaleString()}
                                                        </Typography>
                                                        <ReactMarkdown>
                                                            {decodeHTML(
                                                                subcomment.body_markdown
                                                            )}
                                                        </ReactMarkdown>
                                                        <Typography
                                                            variant="caption"
                                                            className={
                                                                subcomment.date
                                                            }>{`votes => ${subcomment.score}`}</Typography>
                                                    </CardContent>
                                                </Card>
                                                </Box>
                                                
                                            );
                                        })
                                        : null}
                                </Card>
                            );
                        })
                        : null}
                </Card>
            </Card>
        </Box>

    );
};

export default QueryView;
