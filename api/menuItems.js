const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $menu_id', {$menu_id: req.menu.id}, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ menuItems: menuItems });
    }
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.menu.id;
  if (!name || !description || !inventory || !price) {
    res.status(400).send();
  } else {
    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)';
    const values = {$name: name, $description: description, $inventory: inventory, $price: price, $menu_id: menuId};
    db.run(sql, values, function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
          res.status(201).send({ menuItem: menuItem });
        });
      }
    });
  }
});

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) => {
    if (err) {
      next(err);
    } else {
      if (!menuItem) {
        res.status(404).send();
      } else {
        req.menuItem = menuItem;
        next();
      }
    }
  });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.menu.id;
  if (!name || !description || !inventory || !price) {
    res.status(400).send();
  } else {
    const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menu_id WHERE id = $id';
    const values = {$name: name, $description: description, $inventory: inventory, $price: price, $menu_id: menuId, $id: req.menuItem.id};
    db.run(sql, values, (err) => {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) => {
          res.status(200).send({ menuItem: menuItem });
        });
      }
    });
  }
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.menuItem.id}`, (err) => {
    if (err) {
      next(err);
    } else {
      res.status(204).send();
    }
  });
});

module.exports = menuItemsRouter;
