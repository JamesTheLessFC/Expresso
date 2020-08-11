const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({employees: employees});
    }
  });
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    res.status(400).send();
  } else {
    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)';
    const values = {$name: name, $position: position, $wage: wage, $is_current_employee: isCurrentEmployee};
    db.run(sql, values, function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
          res.status(201).send({ employee: employee });
        });
      }
    });
  }
});

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
    if (err) {
      next(err);
    } else {
      if (!employee) {
        res.status(404).send();
      } else {
        req.employee = employee;
        next();
      }
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({ employee: req.employee });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    res.status(400).send();
  } else {
    const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $is_current_employee WHERE id = ${req.params.employeeId}`;
    const values = {$name: name, $position: position, $wage: wage, $is_current_employee: isCurrentEmployee};
    db.run(sql, values, (err) => {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
          res.status(200).send({ employee: employee });
        });
      }
    });
  }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
        res.status(200).send({ employee: employee });
      });
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

module.exports = employeesRouter;
