const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.employee.id}`, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ timesheets: timesheets });
    }
  });
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.employee.id;
  if (!hours || !rate || !date) {
    res.status(400).send();
  } else {
    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)';
    const values = {$hours: hours, $rate: rate, $date: date, $employee_id: employeeId};
    db.run(sql, values, function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
          res.status(201).send({ timesheet: timesheet });
        });
      }
    });
  }
});

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (err, timesheet) => {
    if (err) {
      next(err);
    } else {
      if (!timesheet) {
        res.status(404).send();
      } else {
        req.timesheet = timesheet;
        next();
      }
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.employee.id;
  if (!hours || !rate || !date) {
    res.status(400).send();
  } else {
    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE id = $id';
    const values = {$hours: hours, $rate: rate, $date: date, $employee_id: employeeId, $id: req.params.timesheetId};
    db.run(sql, values, function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, timesheet) => {
          res.status(200).send({ timesheet: timesheet });
        });
      }
    });
  }
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err) => {
    if (err) {
      next(err);
    } else {
      res.status(204).send();
    }
  });
});

module.exports = timesheetsRouter;
