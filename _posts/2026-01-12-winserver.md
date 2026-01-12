---
layout: winserver 
title: "winserver 版本转换"
categories: [server]
---
微软官方并不提供server系统的正式版本，只提供测试的评估版本，使用正版key前需要先转版本，那么我们怎么修改为正式版本呢？

**版本确认**

开始————运行————CMD(管理员模式)
cmd命令页面输入：winver 会弹出版本页面 查看具体为数据中心版还是标准版（知道版本请直接忽略此步骤）

**转换版本**

标准版输入命令：

DISM /online /Set-Edition:ServerStandard /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula
或者
DISM /online /Set-Edition:ServerStandard /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula /LimitAccess 
避免从windows update获取数据
数据中心版输入命令：

DISM /online /Set-Edition:ServerDatacenter /ProductKey:XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /AcceptEula
XXXX为此版本的激活密钥
命令成功会提示开始升级组件，并有10%-100%进度条显示

3. 按Y重启操作系统升级成功
   
**激活码：（此处的激活码只限安装，不能激活）**


2022标准：CR9K8-RDN9C-VD8FD-WK49B-KD97B

2022数据：Q4N8P-8BV9D-8MR8W-3VY9F-CR7JH

2019标准：3D27V-J2N4Q-8C9D8-BTXY8-D9QD3

2019数据：JFMVW-2NQKT-TTDV9-JYDVR-F63FR

2016标准：PBFFT-7KNRF-3R798-X8TY7-6XYKR

2016数据：QV2J9-N9W7K-R2C2Q-3VVJF-R3MMF

2012r2标准：P7BPM-2VNQB-XDYJJ-V7PGW-7FQWM

2012r2数据：K2N4F-9G8P3-FDTKM-YMXCH-HXKCT 

2025标准：TVRH6-WHNXV-R9WG3-9XRFY-MY832

2025数据：D764K-2NDRG-47T6Q-P8T8W-YP6DF
