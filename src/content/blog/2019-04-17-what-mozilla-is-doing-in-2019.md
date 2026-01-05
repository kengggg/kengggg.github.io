---
title: 'What Mozilla is doing in 2019'
date: 2019-04-17
categories: [works]
tags: [internet, mozilla]
featured_image: /images/blog/keng.blog-mozilla-logo-blog-cover.png
excerpt: 'หลายปีผ่านมา Mozilla ทำอะไรอยู่บ้าง'
---

ไม่ได้ทำงานให้ Mozilla มาหลายปี เลยลองเช็คดูว่าตอนนี้ Mozilla ทำอะไรอยู่และเป็นอย่างไรบ้าง

# Firefox

งานหลักขององค์กร ตอนนี้ถึงเวอร์ชัน 66 แล้ว แต่ออกนอกลู่นอกทางไปหน่อยจนส่วนแบ่งตลาดเว็บเบราเซอร์[ทั่วโลก][1]เหลือแค่ไม่ถึง 5% [ในไทย][2]เหลือแค่ 2% ต้นๆ แนวทางของ Firefox ก็คงไม่ได้คาดหวังส่วนแบ่งตลาดแต่เป็นทางเลือกให้ผู้ใช้

![Firefox market share in Thailand][fig1]

ส่วนแบ่งตลาดของเว็บเบราเซอร์ในไทย มีนาคม พ.ศ. 2562

# Privacy


งานด้าน Privacy ของ Mozilla จะเป็นส่วนต่อยอดจาก Firefox ที่แน่วแน่เรื่องสนับสนุนความปลอดภัยของผู้ใช้อินเทอร์เน็ต งานเด่นคือ [Firefox Container][3] ที่งานหลักคือเอาไว้ขัง session ของ Facebook ไม่ให้ไปสปาย session อื่นๆ ของ Firefox ในขณะที่เราท่องเว็บ

![Firefox container logo][fig2]

# Researches

อันนี้มีหลายอัน ภาพรวมคืองานวิจัยเพื่อต่อสู้ให้อินเทอร์เน็ตไม่โดนครองโดยบริษัทขนาดยักษ์ และ อีกส่วนหนึ่งคือการผลักดันเทคโนโลยีเว็บ เท่าที่เห็นคือ

- [Mixed Reality][4] – เว็บเบราเซอร์สำหรับ VR
- [Common Voice][5] – ฐานข้อมูลเสียงพูดแบบเปิดสำหรับการสอน AI
- [Rust][6] – ภาษาโปรแกรมสำหรับการประมวลผลแบบขนาน
- [Servo][7] – Engine การวาดหน้าเว็บที่พัฒนาด้วยภาษา Rust
- [WebAssembly][8] – เทคโนโลยีที่ทำให้ฟอร์แมต binary ทำงานบนเว็บเบราเซอร์ได้

โดยส่วนตัวคิดว่า Mixed Reality ไม่น่าจะรอด และ Mozilla ในฐานะองค์กรพอถึงจุดหนึ่งอาจจะต้องแยกส่วน Firefox และ Research ออกจากกัน

[1]: http://gs.statcounter.com/browser-market-share
[2]: http://truehits.net/graph/graph_stat.php#WEB
[3]: https://www.mozilla.org/th/firefox/facebookcontainer/
[4]: https://research.mozilla.org/mixed-reality/
[5]: https://voice.mozilla.org/en
[6]: https://research.mozilla.org/rust/
[7]: https://research.mozilla.org/servo-engines/
[8]: https://research.mozilla.org/webassembly/

[fig1]: /images/blog/keng.blog-firefox-market-share-in-thailand.png
[fig2]: /images/blog/keng.blog-firefox-container-logo.jpg
