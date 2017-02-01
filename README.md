# ecard-wxe
一卡通应用系统（微信企业号）

## 特别注意事项
- 所有商户必须具有唯一的ID(ShopId)和名称(ShopName)；

## CHANGELOG

### v1.2
- 根据商户树形结构调整权限检查。只需对父节点授权即可获得节点以下所有子节点的查看权限；
- 账单名称统一为：日账单、月账单；
- 实现日账单、月账单微信推送消息图片可配置；
- 实现https的可配置；
- 对URL输入的参数进行检查，避免SQL注入；
- 页面账单显示`消费金额`和`冲正金额`，`合计金额`为二者只差；
- 显示子商户及设备数量;

## TODO

- 参数进入页面之前应完成数据类型的转换；
- 设备账单应处理冲正金额；
