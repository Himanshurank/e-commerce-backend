export class ApiResponse<T = any> {
  constructor(
    public readonly statusCode: number,
    public readonly data: T,
    public readonly message: string,
    public readonly success: boolean = true
  ) {}
}

export class ApiError {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errors: any[] = [],
    public readonly success: boolean = false
  ) {}
}
