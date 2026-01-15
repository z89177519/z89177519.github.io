---
layout: winserver 
title: "Windows Server 版本转换指南"
categories: [server]
---

## 概述

微软官方提供的 Windows Server 评估版（Evaluation）需要转换为正式版本后才能使用正版密钥激活。本文介绍如何将评估版转换为标准版或数据中心版。

### ⚠️ 重要说明

- 本文提供的密钥仅用于**版本转换**，不能用于激活系统
- 转换过程需要重启系统，请提前保存工作
- 建议在转换前创建系统快照或备份

---

## 版本确认

在转换前，需要确认当前系统版本和目标版本。

### 方法一：通过 winver 命令

1. 按 `Win + R` 打开运行窗口
2. 输入 `winver` 并回车
3. 在弹出窗口中查看版本信息

**示例输出**：
```
Microsoft Windows Server 2022 Datacenter Evaluation
版本 21H2 (OS 内部版本 20348.1547)
```

### 方法二：通过 PowerShell

```powershell
# 以管理员身份运行 PowerShell
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion

# 或使用
Get-WmiObject -Class Win32_OperatingSystem | Select-Object Caption, Version
```

### 方法三：通过 DISM 命令

```cmd
DISM /online /Get-CurrentEdition
```

**输出示例**：
```
当前版本为：
当前版本: ServerDatacenterEval
```

---

## 转换步骤

### 准备工作

1. **备份重要数据**（强烈建议）
2. **确保有稳定的电源供应**
3. **关闭不必要的应用程序**
4. **准备好对应版本的安装密钥**

### 执行转换

#### 步骤 1：以管理员身份打开命令提示符

- 方法一：按 `Win + X`，选择"命令提示符(管理员)"或"Windows PowerShell(管理员)"
- 方法二：在开始菜单搜索 `cmd`，右键选择"以管理员身份运行"

#### 步骤 2：执行转换命令

##### 转换为标准版（Standard）

**基础命令**：
```cmd
DISM /online /Set-Edition:ServerStandard /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula
```

**避免联网更新的命令**（推荐）：
```cmd
DISM /online /Set-Edition:ServerStandard /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula /LimitAccess
```

**参数说明**：
- `/online`：对当前运行的操作系统执行操作
- `/Set-Edition:ServerStandard`：设置目标版本为标准版
- `/ProductKey:`：指定产品密钥
- `/AcceptEula`：自动接受许可协议
- `/LimitAccess`：阻止从 Windows Update 获取数据（可选）

##### 转换为数据中心版（Datacenter）

```cmd
DISM /online /Set-Edition:ServerDatacenter /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula
```

**避免联网更新的命令**（推荐）：
```cmd
DISM /online /Set-Edition:ServerDatacenter /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula /LimitAccess
```

#### 步骤 3：等待转换完成

命令执行后会显示进度：

```
部署映像服务和管理工具
版本: 10.0.20348.1

正在升级组件...
进度: 10%
进度: 25%
进度: 50%
...
进度: 100%

操作成功完成。
需要重新启动计算机才能完成此操作。
是否要立即重新启动计算机? (Y/N)
```

**转换过程通常需要 5-15 分钟**，具体时间取决于系统性能。

#### 步骤 4：重启系统

- 输入 `Y` 并回车，系统将自动重启
- 重启过程中会继续完成版本升级
- 请勿强制关机或断电

---

## 版本转换密钥（KMS 客户端安装密钥）

以下密钥是微软官方提供的 **KMS 客户端安装密钥（GVLK）**，**仅用于版本转换**，不能用于系统激活。

### ⚠️ 密钥说明
- 这些是微软官方公开的 **KMS 客户端安装密钥（GVLK）**
- 可在 [Microsoft 官方文档](https://learn.microsoft.com/zh-cn/windows-server/get-started/kms-client-activation-keys) 查询验证
- 仅用于将评估版转换为对应的正式版本
- 转换完成后需要使用**正版零售密钥**或**企业批量许可证**激活系统
- 这些密钥是公开的，使用它们不违反微软许可协议

### 📋 完整密钥列表

### Windows Server 2025

| 版本 | 密钥 |
|------|------|
| 标准版 | `TVRH6-WHNXV-R9WG3-9XRFY-MY832` |
| 数据中心版 | `D764K-2NDRG-47T6Q-P8T8W-YP6DF` |

### Windows Server 2022

| 版本 | 密钥 |
|------|------|
| 标准版 | `VDYBN-27WPP-V4HQT-9VMD4-VMK7H` |
| 数据中心版 | `WX4NM-KYWYW-QJJR4-XV3QB-6VM33` |

### Windows Server 2019

| 版本 | 密钥 |
|------|------|
| 标准版 | `N69G4-B89J2-4G8F4-WWYCC-J464C` |
| 数据中心版 | `WMDGN-G9PQG-XVVXX-R3X43-63DFG` |

### Windows Server 2016

| 版本 | 密钥 |
|------|------|
| 标准版 | `WC2BQ-8NRM3-FDDYY-2BFGV-KHKQY` |
| 数据中心版 | `CB7KF-BWN84-R7R2Y-793K2-8XDDG` |

### Windows Server 2012 R2

| 版本 | 密钥 |
|------|------|
| 标准版 | `D2N9P-3P6X9-2R39C-7RTCD-MDVJX` |
| 数据中心版 | `W3GGN-FT8W3-Y4M27-J84CP-Q3VJ9` |

---

## 转换后的操作

### 验证版本

转换完成并重启后，验证版本是否正确：

**方法一：使用 winver**
```cmd
winver
```

**方法二：使用 DISM**
```cmd
DISM /online /Get-CurrentEdition
```

**方法三：使用 PowerShell**
```powershell
Get-ComputerInfo | Select-Object WindowsProductName
```

**方法四：使用 slmgr**
```cmd
slmgr /dli
```

**预期输出示例**：
```
Windows Server 2022 Standard
或
Windows Server 2022 Datacenter
```

⚠️ **重要**：版本名称中应该**不再包含 "Evaluation"** 字样。如果仍然显示 Evaluation，说明转换未成功。

### 激活系统

版本转换完成后，需要使用正版密钥激活系统。

#### 使用命令行激活

**步骤 1：安装产品密钥**
```cmd
slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
```

**步骤 2：设置 KMS 服务器**（如果使用 KMS 激活）
```cmd
slmgr /skms kms.server.address:1688
```

**步骤 3：激活系统**
```cmd
slmgr /ato
```

**步骤 4：查看激活状态**
```cmd
# 简要信息
slmgr /xpr

# 详细信息
slmgr /dli

# 完整信息
slmgr /dlv
```

**预期输出**（激活成功）：
```
Windows(R), ServerDatacenter edition:
    产品密钥部分: XXXXX
    许可证状态: 已授权
```

#### 通过图形界面激活

1. 打开"设置" → "更新和安全" → "激活"
2. 点击"更改产品密钥"
3. 输入正版密钥并激活

---

## 故障排查

### 常见错误及解决方案

#### 错误 1：找不到指定的版本

**错误信息**：
```
错误: 87
找不到指定的版本。
```

**解决方法**：
- 检查命令中的版本名称是否正确（ServerStandard 或 ServerDatacenter）
- 确认当前版本是否支持转换到目标版本
- 使用 `DISM /online /Get-TargetEditions` 查看可用的目标版本

#### 错误 2：产品密钥无效

**错误信息**：
```
错误: 0xC004F050
软件授权服务报告产品密钥无效。
```

**可能原因**：
1. 密钥输入错误
2. 密钥与当前版本不匹配
3. 使用了错误的密钥类型

**解决方法**：

1. **检查密钥是否正确**：
   - 确认密钥中没有空格或特殊字符
   - 注意区分数字 0 和字母 O
   - 注意区分数字 1 和字母 I

2. **确认版本匹配**：
   ```cmd
   # 查看当前版本
   DISM /online /Get-CurrentEdition
   
   # 查看可转换目标
   DISM /online /Get-TargetEditions
   ```

3. **使用本文档提供的最新密钥**：
   参考上方密钥表格中对应版本的密钥

#### 错误 3：DISM 操作失败

**错误信息**：
```
错误: 0x800f0805
DISM 失败。不支持该操作。
```

**解决方法**：
```cmd
# 清理组件存储
DISM /online /Cleanup-Image /RestoreHealth

# 然后重新尝试转换命令
```

#### 错误 4：需要重新启动

如果系统提示需要重启但未自动重启：

```cmd
# 手动重启
shutdown /r /t 0

# 或使用 PowerShell
Restart-Computer -Force
```

### 转换失败的恢复

如果转换过程中出现问题：

1. **检查系统日志**：
   ```cmd
   eventvwr.msc
   ```
   查看"Windows 日志" → "系统"中的错误信息

2. **使用系统还原**（如果之前创建了还原点）：
   ```cmd
   rstrui.exe
   ```

3. **重新安装系统**（最后手段）

---

## 批量转换脚本

对于需要转换多台服务器的场景，可以使用以下 PowerShell 脚本：

```powershell
# 版本转换脚本
# 使用前请修改 $ProductKey 变量

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("Standard","Datacenter")]
    [string]$Edition,
    
    [Parameter(Mandatory=$true)]
    [string]$ProductKey
)

# 设置版本名称
$EditionName = "Server$Edition"

# 执行转换
Write-Host "开始转换到 $EditionName 版本..." -ForegroundColor Green

try {
    $Result = DISM /online /Set-Edition:$EditionName /ProductKey:$ProductKey /AcceptEula /LimitAccess
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "转换成功！" -ForegroundColor Green
        Write-Host "请重启系统完成转换。" -ForegroundColor Yellow
        
        $Restart = Read-Host "是否立即重启? (Y/N)"
        if ($Restart -eq 'Y' -or $Restart -eq 'y') {
            Restart-Computer -Force
        }
    } else {
        Write-Host "转换失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "发生错误: $_" -ForegroundColor Red
}
```

**使用方法**：

```powershell
# 转换为标准版
.\Convert-ServerEdition.ps1 -Edition Standard -ProductKey "VDYBN-27WPP-V4HQT-9VMD4-VMK7H"

# 转换为数据中心版
.\Convert-ServerEdition.ps1 -Edition Datacenter -ProductKey "WX4NM-KYWYW-QJJR4-XV3QB-6VM33"
```

---

## 版本对比

### 标准版 vs 数据中心版

| 功能特性 | 标准版 | 数据中心版 |
|---------|--------|-----------|
| 虚拟机授权 | 最多 2 个 | 无限制 |
| 存储副本 | ❌ | ✅ |
| 屏蔽虚拟机 | ❌ | ✅ |
| 软件定义网络 | ❌ | ✅ |
| 存储空间直通 | ❌ | ✅ |
| 价格 | 较低 | 较高 |

**选择建议**：
- **标准版**：适合小型企业、单机部署或少量虚拟化需求
- **数据中心版**：适合大型数据中心、虚拟化环境或需要高级功能的场景

---

## 注意事项

### ⚠️ 重要提醒

1. **密钥性质**
   - 本文提供的密钥是 KMS 客户端安装密钥（GVLK）
   - 仅用于版本转换，无法激活系统
   - 激活需要使用正版零售密钥或 KMS/MAK 密钥

2. **合规性**
   - 请确保使用正版授权
   - 企业环境建议使用批量许可证（Volume License）
   - 避免使用非法激活工具

3. **数据安全**
   - 转换前务必备份重要数据
   - 建议在虚拟机中测试后再在生产环境操作
   - 创建系统快照或还原点

4. **版本限制**
   - 评估版只能转换为对应的正式版本
   - 无法从低版本直接升级到高版本（如 2019 → 2022）
   - 某些版本可能不支持直接转换

---

## 最佳实践

### 转换前检查清单

- [ ] 确认当前系统版本和目标版本
- [ ] 备份重要数据和配置
- [ ] 准备好正确的安装密钥
- [ ] 确保网络连接稳定（如不使用 /LimitAccess）
- [ ] 关闭杀毒软件和防火墙（可选）
- [ ] 记录当前系统配置

### 转换后验证清单

- [ ] 验证版本是否正确转换（无 "Evaluation" 字样）
- [ ] 检查许可证状态（应显示"未授权"状态，等待激活）
- [ ] 确认系统服务正常运行
- [ ] 验证网络连接正常
- [ ] 测试关键应用程序
- [ ] 使用正版密钥激活系统
- [ ] 验证激活成功（`slmgr /xpr` 应显示"已授权"）
- [ ] 重新启用杀毒软件和防火墙
- [ ] 检查 Windows Update 功能正常

---

## 参考命令速查

```cmd
# 查看当前版本
DISM /online /Get-CurrentEdition

# 查看可转换的目标版本
DISM /online /Get-TargetEditions

# 转换为标准版
DISM /online /Set-Edition:ServerStandard /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula /LimitAccess

# 转换为数据中心版
DISM /online /Set-Edition:ServerDatacenter /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula /LimitAccess

# 安装产品密钥
slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX

# 激活系统
slmgr /ato

# 查看激活状态
slmgr /xpr
slmgr /dli

# 检查系统信息
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```

---

## 常见问题 FAQ

**Q1：转换后是否会丢失数据？**
A：正常情况下不会丢失数据，但强烈建议提前备份。

**Q2：转换需要多长时间？**
A：通常 5-15 分钟，取决于系统性能和配置。

**Q3：可以从标准版转换为数据中心版吗？**
A：可以，但需要使用正确的密钥和命令。

**Q4：转换失败会怎样？**
A：系统可能无法启动或回滚到原版本，建议提前创建快照。

**Q5：是否需要联网？**
A：
- 使用 `/LimitAccess` 参数可离线转换（推荐）
- 不使用该参数时，DISM 可能从 Windows Update 下载必要组件
- 建议使用 `/LimitAccess` 以提高转换速度和稳定性

**Q6：转换后还需要激活吗？**
A：是的，必须激活。转换密钥（GVLK）仅用于版本转换，系统激活需要：
- 零售版密钥（Retail Key）
- 批量授权密钥（MAK Key）
- 连接到 KMS 服务器进行激活

---

## 总结

通过本指南，你可以顺利完成 Windows Server 评估版到正式版的转换。关键要点：

- ✅ 转换前确认版本并备份数据
- ✅ 使用正确的 DISM 命令和密钥
- ✅ 转换后使用正版密钥激活
- ✅ 遵循最佳实践确保转换成功

---

## 参考资源

- [Microsoft 官方文档 - Windows Server 安装密钥](https://learn.microsoft.com/zh-cn/windows-server/get-started/kms-client-activation-keys)
- [DISM 命令行参考](https://learn.microsoft.com/zh-cn/windows-hardware/manufacture/desktop/dism-operating-system-package-servicing-command-line-options)
- [Windows Server 激活指南](https://learn.microsoft.com/zh-cn/windows-server/get-started/activation-overview)
