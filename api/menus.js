const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ menus: menus });
    }
  });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    res.status(400).send();
  } else {
    db.run('INSERT INTO Menu (title) VALUES ($title)', {$title: title}, function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
          res.status(201).send({ menu: menu });
        });
      }
    });
  }
});

menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else {
      if (!menu) {
        res.status(404).send();
      } else {
        req.menu = menu;
        next();
      }
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({ menu: req.menu });
});

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    res.status(400).send();
  } else {
    db.run(`UPDATE Menu SET title = $title WHERE id = ${req.params.menuId}`, {$title: title}, (err) => {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
          res.status(200).send({ menu: menu });
        });
      }
    });
  }
});

menusRouter.delete('/:menuId', (req, res, next) => {
  db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menuItem) => {
    if (err) {
      next(err);
    } else {
      if (menuItem) {
        res.status(400).send();
      } else {
        db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, (err) => {
          res.status(204).send();
        });
      }
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menusRouter;
