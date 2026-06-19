const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
    try {
        const { search, status, sort, page = 1, limit = 6 } = req.query;
        let query = { user: req.user._id };

        if (search) query.title = { $regex: search, $options: 'i' };
        if (status && status !== 'All') query.status = status;

        let sortObj = { createdAt: -1 }; 
        if (sort === 'oldest') sortObj = { createdAt: 1 };

        const skip = (page - 1) * limit;

        const tasks = await Task.find(query).sort(sortObj).skip(skip).limit(parseInt(limit));
        const total = await Task.countDocuments(query);
        const allUserTasks = await Task.find({ user: req.user._id }); // For dashboard stats

        res.status(200).json({
            tasks,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            stats: {
                total: allUserTasks.length,
                pending: allUserTasks.filter(t => t.status === 'Pending').length,
                completed: allUserTasks.filter(t => t.status === 'Completed').length,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching tasks' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const task = await Task.create({ user: req.user._id, title, description, status });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

        task.status = req.body.status;
        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

        await task.deleteOne();
        res.status(200).json({ message: 'Task removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting task' });
    }
};