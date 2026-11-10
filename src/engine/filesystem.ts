import { VFSNode } from '../types';

export function createInitialVFS(): { root: VFSNode; currentPath: string[] } {
  const root: VFSNode = {
    name: '/',
    type: 'dir',
    permissions: 'rwxr-xr-x',
    size: 4096,
    updatedAt: 'Nov 10 20:20',
    children: {
      home: {
        name: 'home',
        type: 'dir',
        permissions: 'rwxr-xr-x',
        size: 4096,
        updatedAt: 'Nov 10 20:20',
        children: {
          student: {
            name: 'student',
            type: 'dir',
            permissions: 'rwxr-xr-x',
            size: 4096,
            updatedAt: 'Nov 10 20:20',
            children: {
              'main.c': {
                name: 'main.c',
                type: 'file',
                permissions: 'rw-r--r--',
                size: 342,
                updatedAt: 'Nov 10 20:21',
                content: `#include <stdio.h>\n#include <unistd.h>\n\nint main() {\n    printf("Kernel OS v6.8 Playground Initialized\\n");\n    printf("PID: %d, PPID: %d\\n", getpid(), getppid());\n    return 0;\n}`,
              },
              'readme.txt': {
                name: 'readme.txt',
                type: 'file',
                permissions: 'rw-r--r--',
                size: 184,
                updatedAt: 'Nov 10 20:21',
                content: 'Welcome to Kernel! This terminal operates purely on a safe in-browser Virtual File System (VFS).\nUse ls, cd, cat, touch, mkdir, rm, ps, and free.',
              },
            },
          },
        },
      },
      etc: {
        name: 'etc',
        type: 'dir',
        permissions: 'rwxr-xr-x',
        size: 4096,
        updatedAt: 'Nov 10 20:20',
        children: {
          'os-release': {
            name: 'os-release',
            type: 'file',
            permissions: 'r--r--r--',
            size: 88,
            updatedAt: 'Nov 10 20:20',
            content: 'NAME="Kernel OS"\nVERSION="6.8-browser"\nID=kernel-edu\nPRETTY_NAME="Kernel Interactive Systems Lab"',
          },
          hostname: {
            name: 'hostname',
            type: 'file',
            permissions: 'rw-r--r--',
            size: 15,
            updatedAt: 'Nov 10 20:20',
            content: 'kernel-node-01\n',
          },
        },
      },
      var: {
        name: 'var',
        type: 'dir',
        permissions: 'rwxr-xr-x',
        size: 4096,
        updatedAt: 'Nov 10 20:20',
        children: {
          log: {
            name: 'log',
            type: 'dir',
            permissions: 'rwxr-xr-x',
            size: 4096,
            updatedAt: 'Nov 10 20:20',
            children: {
              'dmesg.log': {
                name: 'dmesg.log',
                type: 'file',
                permissions: 'rw-r--r--',
                size: 210,
                updatedAt: 'Nov 10 20:20',
                content: '[    0.000000] Linux version 6.8.0-browser-kernel\n[    0.002140] Initializing cgroup subsys cpuset\n[    0.004820] Memory: 1048576K/1048576K available\n[    0.010400] Virtual File System initialized.\n',
              },
            },
          },
        },
      },
    },
  };

  return { root, currentPath: ['home', 'student'] };
}

export function executeCommand(
  rawInput: string,
  root: VFSNode,
  currentPath: string[]
): {
  output: string;
  newPath: string[];
  newRoot: VFSNode;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { output: '', newPath: currentPath, newRoot: root };
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  const getDir = (path: string[], tree: VFSNode): VFSNode | null => {
    let curr = tree;
    for (const segment of path) {
      if (!curr.children || !curr.children[segment] || curr.children[segment].type !== 'dir') {
        return null;
      }
      curr = curr.children[segment];
    }
    return curr;
  };

  const currDir = getDir(currentPath, root);
  if (!currDir || !currDir.children) {
    return { output: 'VFS Error: Current working directory not found.', newPath: [], newRoot: root };
  }

  switch (cmd) {
    case 'pwd':
      return {
        output: '/' + currentPath.join('/'),
        newPath: currentPath,
        newRoot: root,
      };

    case 'help':
      return {
        output: [
          'Kernel Virtual Shell — Built-in commands:',
          '  pwd          Print current working directory',
          '  ls [-l]      List directory contents',
          '  cd <dir>     Change directory (supports .. and /)',
          '  cat <file>   Display file contents',
          '  touch <file> Create an empty file',
          '  mkdir <dir>  Create a new directory',
          '  rm <file>    Remove a file or directory',
          '  echo <text>  Echo text (e.g. echo "code" > file.txt)',
          '  ps           List active virtual kernel processes',
          '  free         Display virtual memory statistics',
          '  uname -a     Display kernel architecture',
          '  clear        Clear the terminal display',
        ].join('\n'),
        newPath: currentPath,
        newRoot: root,
      };

    case 'uname':
      return {
        output: 'Linux kernel-node-01 6.8.0-browser-edu #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
        newPath: currentPath,
        newRoot: root,
      };

    case 'ps':
      return {
        output: [
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:01 systemd',
          '    2 ?        00:00:00 kthreadd',
          '  240 pts/0    00:00:00 bash',
          '  412 pts/0    00:00:00 ps',
        ].join('\n'),
        newPath: currentPath,
        newRoot: root,
      };

    case 'free':
      return {
        output: [
          '               total        used        free      shared  buff/cache   available',
          'Mem:         1048576      262144      655360       32768      131072      786432',
          'Swap:        2097152           0     2097152',
        ].join('\n'),
        newPath: currentPath,
        newRoot: root,
      };

    case 'ls': {
      const showLong = args.includes('-l');
      const items = Object.values(currDir.children);
      if (items.length === 0) return { output: '', newPath: currentPath, newRoot: root };

      if (showLong) {
        const out = items.map((item) => {
          const prefix = item.type === 'dir' ? 'd' : '-';
          return `${prefix}${item.permissions} 1 student student ${item.size.toString().padStart(5, ' ')} ${item.updatedAt} ${item.name}`;
        });
        return { output: out.join('\n'), newPath: currentPath, newRoot: root };
      } else {
        return { output: items.map((i) => (i.type === 'dir' ? `${i.name}/` : i.name)).join('  '), newPath: currentPath, newRoot: root };
      }
    }

    case 'cd': {
      const target = args[0] || '~';
      if (target === '~' || target === '') {
        return { output: '', newPath: ['home', 'student'], newRoot: root };
      }
      if (target === '/') {
        return { output: '', newPath: [], newRoot: root };
      }
      if (target === '..') {
        const next = [...currentPath];
        next.pop();
        return { output: '', newPath: next, newRoot: root };
      }

      if (currDir.children[target] && currDir.children[target].type === 'dir') {
        return { output: '', newPath: [...currentPath, target], newRoot: root };
      }
      return { output: `cd: no such file or directory: ${target}`, newPath: currentPath, newRoot: root };
    }

    case 'cat': {
      if (!args[0]) return { output: 'cat: missing operand', newPath: currentPath, newRoot: root };
      const file = currDir.children[args[0]];
      if (!file) return { output: `cat: ${args[0]}: No such file or directory`, newPath: currentPath, newRoot: root };
      if (file.type === 'dir') return { output: `cat: ${args[0]}: Is a directory`, newPath: currentPath, newRoot: root };
      return { output: file.content || '', newPath: currentPath, newRoot: root };
    }

    case 'touch': {
      if (!args[0]) return { output: 'touch: missing file operand', newPath: currentPath, newRoot: root };
      const filename = args[0];
      currDir.children[filename] = {
        name: filename,
        type: 'file',
        permissions: 'rw-r--r--',
        size: 0,
        updatedAt: 'Just now',
        content: '',
      };
      return { output: '', newPath: currentPath, newRoot: { ...root } };
    }

    case 'mkdir': {
      if (!args[0]) return { output: 'mkdir: missing operand', newPath: currentPath, newRoot: root };
      const dirname = args[0];
      if (currDir.children[dirname]) {
        return { output: `mkdir: cannot create directory '${dirname}': File exists`, newPath: currentPath, newRoot: root };
      }
      currDir.children[dirname] = {
        name: dirname,
        type: 'dir',
        permissions: 'rwxr-xr-x',
        size: 4096,
        updatedAt: 'Just now',
        children: {},
      };
      return { output: '', newPath: currentPath, newRoot: { ...root } };
    }

    case 'rm': {
      if (!args[0]) return { output: 'rm: missing operand', newPath: currentPath, newRoot: root };
      const targetName = args[0];
      if (!currDir.children[targetName]) {
        return { output: `rm: cannot remove '${targetName}': No such file or directory`, newPath: currentPath, newRoot: root };
      }
      delete currDir.children[targetName];
      return { output: '', newPath: currentPath, newRoot: { ...root } };
    }

    case 'echo': {
      const redirectIdx = args.indexOf('>');
      if (redirectIdx !== -1 && redirectIdx < args.length - 1) {
        const text = args.slice(0, redirectIdx).join(' ').replace(/^["']|["']$/g, '');
        const filename = args[redirectIdx + 1];
        currDir.children[filename] = {
          name: filename,
          type: 'file',
          permissions: 'rw-r--r--',
          size: text.length,
          updatedAt: 'Just now',
          content: text + '\n',
        };
        return { output: '', newPath: currentPath, newRoot: { ...root } };
      }
      return { output: args.join(' ').replace(/^["']|["']$/g, ''), newPath: currentPath, newRoot: root };
    }

    default:
      return {
        output: `${cmd}: command not found. Type 'help' for available commands.`,
        newPath: currentPath,
        newRoot: root,
      };
  }
}
