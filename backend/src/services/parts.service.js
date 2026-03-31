const partRepository = require('../repositories/part.repository');
const categoryRepository = require('../repositories/category.repository');
const { NotFoundError } = require('../utils/errors');

class PartsService {
  findAll(filters) {
    const parts = partRepository.findAll(filters);
    return parts.map(this._parsePart);
  }

  findById(id) {
    const part = partRepository.findById(id);
    if (!part) throw new NotFoundError('Peça não encontrada');
    return this._parsePart(part);
  }

  create(data) {
    const partData = this._prepareData(data);
    const part = partRepository.create(partData);
    return this._parsePart(part);
  }

  update(id, data) {
    const existing = partRepository.findById(id);
    if (!existing) throw new NotFoundError('Peça não encontrada');

    const partData = this._prepareData(data);
    const part = partRepository.update(id, partData);
    return this._parsePart(part);
  }

  delete(id) {
    const existing = partRepository.findById(id);
    if (!existing) throw new NotFoundError('Peça não encontrada');
    partRepository.delete(id);
  }

  _prepareData(data) {
    return {
      name: data.name,
      price: parseFloat(data.price),
      category_id: data.category_id || null,
      description: data.description || '',
      image_url: data.image_url || '',
      specifications: typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications || []),
      compatible_cars: typeof data.compatible_cars === 'string' ? data.compatible_cars : JSON.stringify(data.compatible_cars || []),
    };
  }

  _parsePart(part) {
    if (!part) return null;
    return {
      ...part,
      specifications: typeof part.specifications === 'string' ? JSON.parse(part.specifications) : part.specifications,
      compatible_cars: typeof part.compatible_cars === 'string' ? JSON.parse(part.compatible_cars) : part.compatible_cars,
    };
  }
}

module.exports = new PartsService();
