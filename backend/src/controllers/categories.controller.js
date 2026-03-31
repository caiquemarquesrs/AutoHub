const categoryRepository = require('../repositories/category.repository');

class CategoriesController {
  findAll(req, res, next) {
    try {
      const categories = categoryRepository.findAll();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoriesController();
