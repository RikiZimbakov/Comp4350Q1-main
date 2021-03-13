import React, { useState, useEffect } from 'react';
import { makeStyles, TextField, Button } from '@material-ui/core';
import useForm from './hooks/useForm';
import QueryView from './components/QueryView';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
        },
        background: 'antiquewhite',
    },
    header: {
        'font-weight': 'bolder',
        'font-family': 'sans-serif',
        'font-size': 'xx-large',
        'color': 'darkgreen',
        'white-space': 'nowrap',
        display: 'flex',
        margin: 'auto',
        bottom: '0px',
    },
    queryView: {
        width: '100%',
        height: '85%',
    },
    btnFindView: {
        height: '15%',
        width: '25%',
        display: 'flex',
        'align-items': 'center',
        margin: 'inherit',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '200',
    },
    bottom: {
        'text-align': 'center',
        'white-space': 'nowrap',
        'font-size': 'larger',
        display: 'flex',
        'align-items': 'center',
        margin: 'auto',
        bottom: '0px',
    },
}));

const App = () => {
    const classes = useStyles();

    const [val, setVal] = useState(false);
    const [milliSecs, setMilliSecs] = useState(0);
    const [err, setErr] = useState({});
    const [res, setRes] = useState([]);

    const [form, onFormChange] = useForm({
        value: '',
    });

    const validateForm = () => {
        let err = {};
        if (!form.value) {
            err.value = 'value needed';
        }
        setErr(err);
        setVal(Object.getOwnPropertyNames(err).length === 0);
    };

    useEffect(() => {
        const dateStart = moment().subtract(7, 'd').utc().startOf('day').unix();
        const dateFinish = moment().add(1, 'd').utc().endOf('day').unix();

        const dateRequest = value => {
            return fetch(
                `https://api.stackexchange.com/2.2/questions?fromdate=${dateStart}&todate=${dateFinish}&pagesize=10&order=desc&sort=creation&tagged=${value}&site=stackoverflow`
            );
        };

        const votesRequest = value => {
            return fetch(
                `https://api.stackexchange.com/2.2/questions?fromdate=${dateStart}&todate=${dateFinish}&pagesize=10&order=desc&sort=votes&tagged=${value}&site=stackoverflow`
            );
        };

        const retrieveStackValues = async () => {
            if (val) {
                let startTime = Date.now();
                Promise
                    .all([votesRequest(form.value), dateRequest(form.value)])
                    .then(async ([resA, resB]) => {
                        const responseA = await resA.json();
                        const responseB = await resB.json();
                        let queryres = [
                            ...responseA.items,
                            ...responseB.items,
                        ];
                        queryres.sort((firstRes, SecRes) =>
                            firstRes.creation_date <= SecRes.creation_date ? 1 : -1
                        );
                        setMilliSecs(Date.now() - startTime);
                        setRes(queryres);
                    })
            }
        };
        retrieveStackValues();
    }, [val, form]);
    return (
        <div className={classes.root}>
            <div className={classes.header}>
                Risto's Simple Website
            </div>
            <form
                className={classes.btnFindView}
                onSubmit={e => {
                    e.preventDefault();
                }}
                noValidate>
                <TextField
                    className={classes.textField}
                    id="filled-basic"
                    label="Stack-Overflow Tag"
                    variant="filled"
                    name="value"
                    value={form.value}
                    onChange={onFormChange}
                    error={err.value}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <Button variant="contained" color="primary" onClick={validateForm}>FIND</Button>
            </form>
            <div className={classes.queryView}>
                {res
                    ? res.map((item, index) => {
                        return (
                            <QueryView
                                key={index}
                                question_id={item.question_id}
                                title={item.title}
                                creation_date={item.creation_date}
                                votes={item.score}></QueryView>
                        );
                    })
                    : null}
            </div>
            <div className={classes.bottom}>
                {`Time taken => ${milliSecs} milliseconds`}
            </div>
        </div>
    );
};

export default App;