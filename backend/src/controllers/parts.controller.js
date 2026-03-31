const partsService = require('../services/parts.service');

class PartsController {
  findAll(req, res, next) {
    try {
      const { search, category } = req.query;
      const parts = partsService.findAll({ search, categoryId: category });
      res.status(200).json({ success: true, data: parts });
    } catch (err) {
      next(err);
    }
  }

  findById(req, res, next) {
    try {
      const part = partsService.findById(Number(req.params.id));
      res.status(200).json({ success: true, data: part });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PartsController();
