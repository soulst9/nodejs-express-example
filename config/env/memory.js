const memory = {};

exports.setSharedMemory = (key, values) => {
  memory[key] = values;
};

exports.getMemoryValue = (key) => memory[key];
