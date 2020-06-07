const {Router} = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', async (req, res) => {
  try {
    /*
      В userId лежит id создателя курса(user)
      .populate() дает возможность иметь доступ
      к другим параметрам user'а.
      .populate('userId', 'email name') - 
      доступ к параметрам email и name для user'а c userId
    */
    const courses = await Course.find() 
      .populate('userId', 'email name') 
      .select('price title img');

    console.log(courses);  
    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  const course = await Course.findById(req.params.id)

  res.render('course-edit', {
    title: `Редактировать ${course.title}`,
    course
  })
})

router.post('/edit', auth, async (req, res) => {
  const {id} = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body)
  res.redirect('/courses')
})

router.post('/remove', auth, async (req, res) => {
  try { 
    await Course.deleteOne({
      _id: req.body.id
    });
    res.redirect('/courses');
  } catch(e) {
    console.log(e)
  }

})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  res.render('course', {
    layout: 'empty',
    title: `Курс ${course.title}`,
    course
  })
})

module.exports = router