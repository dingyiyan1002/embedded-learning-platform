const cKeywords: Record<string, string> = {
  'int': '整数类型，通常4字节',
  'float': '单精度浮点数类型，4字节',
  'double': '双精度浮点数类型，8字节',
  'char': '字符类型，1字节',
  'void': '空类型，无返回值',
  'if': '条件判断语句',
  'else': '条件判断的否定分支',
  'for': 'for循环语句',
  'while': 'while循环语句',
  'do': 'do-while循环的开始',
  'switch': '多分支选择语句',
  'case': 'switch的分支标签',
  'break': '跳出当前循环或switch',
  'continue': '跳过本次循环，进入下一次',
  'return': '函数返回语句',
  'struct': '定义结构体类型',
  'typedef': '类型别名定义',
  'sizeof': '计算类型或变量所占字节数',
  'printf': '格式化输出函数',
  'scanf': '格式化输入函数',
  'malloc': '动态内存分配函数',
  'free': '释放动态分配的内存',
  'NULL': '空指针常量，值为0',
  'include': '预处理指令，引入头文件',
  'define': '预处理指令，定义宏',
  'static': '静态存储修饰符',
  'const': '常量修饰符',
  'unsigned': '无符号修饰符',
  'long': '长整型修饰符',
  'short': '短整型修饰符',
  'extern': '外部变量声明',
  'register': '寄存器变量修饰符',
  'volatile': '防止编译器优化的修饰符',
  'goto': '无条件跳转语句',
  'enum': '枚举类型定义',
  'union': '联合体类型定义',
  'strlen': '计算字符串长度（不含\\0）',
  'strcpy': '字符串复制',
  'strcmp': '字符串比较',
  'strcat': '字符串拼接',
  'memcpy': '内存复制',
  'memset': '内存设置',
  'calloc': '分配并初始化为零的内存',
  'realloc': '重新分配内存大小',
  'fopen': '打开文件',
  'fclose': '关闭文件',
  'fread': '从文件读取',
  'fwrite': '向文件写入',
  'assert': '断言宏',
  'main': '程序主函数入口',
  'pointer': '指针，存储内存地址的变量',
  'array': '数组，连续存储的同类型元素集合',
  'string': '字符串，以\\0结尾的字符数组',
  'function': '函数，可重复调用的代码块',
  'recursion': '递归，函数调用自身',
  'algorithm': '算法，解决问题的方法和步骤',
  'stack': '栈，后进先出(LIFO)数据结构',
  'queue': '队列，先进先出(FIFO)数据结构',
  'linked list': '链表，通过指针链接的节点序列',
  'binary tree': '二叉树，每个节点最多两个子节点的树',
  'hash': '哈希，通过哈希函数映射数据',
  'sort': '排序，将数据按特定顺序排列',
  'search': '查找，在数据中寻找目标元素',
};

export function getVocabularyDefinition(word: string): string {
  const normalizedWord = word.toLowerCase().trim();
  return cKeywords[normalizedWord] || cKeywords[word] || '';
}

export function deriveVocabularyFromText(text: string): Array<{ word: string; definition: string }> {
  const found: Array<{ word: string; definition: string }> = [];
  const seen = new Set<string>();

  for (const keyword of Object.keys(cKeywords)) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (regex.test(text) && !seen.has(keyword.toLowerCase())) {
      const def = cKeywords[keyword];
      if (def) {
        found.push({ word: keyword.trim(), definition: def });
        seen.add(keyword.toLowerCase());
      }
    }
  }

  return found;
}

export { cKeywords };
