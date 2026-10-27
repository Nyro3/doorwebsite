# عقد الـ API (للـ Backend لاحقًا)

الـ Frontend جاهز يكلّم الـ endpoints دي. لما تبنيها، شغّل `NEXT_PUBLIC_USE_API=true`
(ولو الـ API على دومين تاني حدد `NEXT_PUBLIC_API_URL`). الكود في `app/lib/products/api.ts`.

## المنتجات

| Method | Path                     | الوصف                                   | صلاحية |
| ------ | ------------------------ | --------------------------------------- | ------ |
| GET    | `/api/products`          | كل المنتجات. `?category=<slug>` للفلترة | عام    |
| GET    | `/api/products/:id`      | منتج واحد                               | عام    |
| POST   | `/api/products`          | إضافة منتج (body = `ProductInput`)      | أدمن   |
| PUT    | `/api/products/:id`      | تعديل منتج (body = `ProductInput`)      | أدمن   |
| DELETE | `/api/products/:id`      | حذف منتج (يرجّع 204)                    | أدمن   |
| POST   | `/api/uploads`           | رفع صورة (`multipart`, حقل `file`) → `{ "url": "..." }` | أدمن |

`category` ∈ `wood-doors | armored-doors | interior-doors | windows`

الشكل بالتفصيل في `types.ts` (`Product` / `ProductInput`). السيرفر هو اللي يولّد `id` و`createdAt` و`updatedAt`.

## الأدمن

- الطلبات بتتبعت بـ `credentials: "include"` (كوكي جلسة). الـ API لازم يرجّع `401/403` لو مش مسجّل.
- صفحة `/admin` حاليًا من غير حماية — لازم تتحمى (login أو middleware/proxy) أول ما الـ Backend يتوصل.

## الطلبات (السلة)

السلة حاليًا في `localStorage` وبتتبعت كرسالة واتساب. لو عايز تحفظ الطلبات في الـ Backend بعدين:
`POST /api/orders` بـ `{ customer: { name, phone }, items: CartItem[] }` وتعدّل زر الإرسال في `CartView.tsx`.
