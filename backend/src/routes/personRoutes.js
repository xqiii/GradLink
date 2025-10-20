const express = require('express');
const router = express.Router();
const {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  batchDeletePersons,
  getStatsByProvince
} = require('../controllers/personController');
const auth = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 基础CRUD路由
router.get('/', getPersons);
router.get('/:id', getPersonById);
router.post('/', createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

// 批量删除路由
router.post('/batch-delete', batchDeletePersons);

// 统计路由
router.get('/stats/province', getStatsByProvince);

module.exports = router;