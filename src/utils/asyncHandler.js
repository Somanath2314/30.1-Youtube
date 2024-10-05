const asyncHandler = (func) => {
    return async (req, res, next) => {
      try {
        await func(req, res, next);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    };
  };

export default asyncHandler